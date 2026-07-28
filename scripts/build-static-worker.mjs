import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const exportDirectory = resolve(projectRoot, "out");
const openNextDirectory = resolve(projectRoot, ".open-next");
const assetsDirectory = resolve(openNextDirectory, "assets");
const workerPath = resolve(openNextDirectory, "worker.js");

const workerSource = `const SECURITY_HEADERS = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function withSecurityHeaders(response) {
  const safeResponse = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    safeResponse.headers.set(name, value);
  }
  return safeResponse;
}

async function fetchAsset(request, env, pathname) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  return env.ASSETS.fetch(new Request(assetUrl, request));
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    let response = await fetchAsset(request, env, pathname);

    if (
      response.status === 404 &&
      !url.pathname.startsWith("/_next/") &&
      !url.pathname.split("/").at(-1)?.includes(".")
    ) {
      response = await fetchAsset(request, env, "/index.html");
    }

    return withSecurityHeaders(response);
  },
};
`;

await rm(openNextDirectory, { recursive: true, force: true });
await mkdir(assetsDirectory, { recursive: true });
await cp(exportDirectory, assetsDirectory, { recursive: true });
await writeFile(workerPath, workerSource);

console.log(`Static Cloudflare bundle created at ${openNextDirectory}`);
