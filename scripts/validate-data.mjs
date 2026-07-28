import { dashboardMeta, slips } from "../data/slips.js";
import { buildMetrics, slipPnl } from "../lib/metrics.js";

const errors = [];
const validResults = new Set(["won", "lost", "void", "pending"]);
const validTypes = new Set(["single", "acca", "builder"]);
const ids = new Set();

for (const slip of slips) {
  if (ids.has(slip.id)) errors.push(`Duplicate slip id: ${slip.id}`);
  ids.add(slip.id);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(slip.date)) {
    errors.push(`${slip.id}: invalid date`);
  }
  if (!validResults.has(slip.result)) {
    errors.push(`${slip.id}: invalid result ${slip.result}`);
  }
  if (!validTypes.has(slip.type)) {
    errors.push(`${slip.id}: invalid type ${slip.type}`);
  }
  if (!Array.isArray(slip.legs) || slip.legs.length === 0) {
    errors.push(`${slip.id}: no legs`);
  }
  if (slip.type === "single" && slip.legs.length !== 1) {
    errors.push(`${slip.id}: single must contain exactly one leg`);
  }
  if (slip.type !== "single" && slip.legs.length < 2) {
    errors.push(`${slip.id}: multi-leg bet must contain at least two legs`);
  }
  if (slip.result === "pending" && slipPnl(slip) !== null) {
    errors.push(`${slip.id}: pending slip generated P/L`);
  }
}

const metrics = buildMetrics(slips);
const expected = {
  slips: 62,
  selections: 110,
  settled: 35,
  priced: 32,
  wins: 28,
  losses: 7,
  pending: 27,
};

for (const [key, value] of Object.entries(expected)) {
  if (metrics[key] !== value) {
    errors.push(`Expected ${key}=${value}; received ${metrics[key]}`);
  }
}

if (Math.abs(metrics.plPts - 15.866673326673325) > 0.000001) {
  errors.push(`Expected priced P/L of 15.87pts; received ${metrics.plPts}`);
}

if (dashboardMeta.import.importedSlips !== slips.length) {
  errors.push("Import metadata slip count does not match data.");
}

if (
  dashboardMeta.import.importedScreenshots !==
  slips.filter((slip) => slip.sourceKind === "screenshot").length
) {
  errors.push("Import metadata screenshot count does not match data.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${metrics.slips} slips / ${metrics.selections} selections: ` +
    `${metrics.wins}W ${metrics.losses}L ${metrics.pending} pending, ` +
    `${metrics.plPts.toFixed(2)}pts priced P/L.`,
);
