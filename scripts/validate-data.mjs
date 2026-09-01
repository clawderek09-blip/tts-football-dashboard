import { dashboardMeta, slips } from "../data/slips.js";
import {
  BET_CATEGORIES,
  buildCategoryMetrics,
  buildMetrics,
  isSettled,
  slipPnl,
} from "../lib/metrics.js";

const errors = [];
const validResults = new Set(["won", "lost", "void", "pending"]);
const validTypes = new Set(["single", "acca", "builder"]);
const validTimings = new Set(["pre-match", "in-play"]);
const ids = new Set();

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFinitePositive(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

if (!isNonEmptyString(dashboardMeta.brand)) errors.push("Meta: brand is required.");
if (!isNonEmptyString(dashboardMeta.period)) errors.push("Meta: period is required.");
if (!isFinitePositive(dashboardMeta.bankSize)) errors.push("Meta: bankSize must be positive.");
if (!isFinitePositive(dashboardMeta.pointValue)) errors.push("Meta: pointValue must be positive.");
if (dashboardMeta.currency !== "GBP") errors.push("Meta: currency must be GBP.");

for (const slip of slips) {
  const prefix = isNonEmptyString(slip.id) ? slip.id : "Unknown slip";

  if (!isNonEmptyString(slip.id)) errors.push(`${prefix}: id is required.`);
  if (ids.has(slip.id)) errors.push(`Duplicate slip id: ${slip.id}`);
  ids.add(slip.id);

  if (!isRealDate(slip.date)) errors.push(`${prefix}: invalid date.`);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(slip.time || "")) {
    errors.push(`${prefix}: time must use 24-hour HH:MM.`);
  }
  if (!isNonEmptyString(slip.title)) errors.push(`${prefix}: title is required.`);
  if (!isNonEmptyString(slip.tipster)) errors.push(`${prefix}: tipster is required.`);
  if (!validResults.has(slip.result)) errors.push(`${prefix}: invalid result ${slip.result}.`);
  if (!validTypes.has(slip.type)) errors.push(`${prefix}: invalid type ${slip.type}.`);
  if (!validTimings.has(slip.timing)) errors.push(`${prefix}: invalid timing ${slip.timing}.`);
  if (!isFinitePositive(slip.stakePts)) errors.push(`${prefix}: stakePts must be positive.`);

  if (slip.odds != null && (!isFinitePositive(slip.odds) || slip.odds <= 1)) {
    errors.push(`${prefix}: decimal odds must be greater than 1.`);
  }
  if (slip.returnPts != null && !(typeof slip.returnPts === "number" && Number.isFinite(slip.returnPts) && slip.returnPts >= 0)) {
    errors.push(`${prefix}: returnPts must be a finite non-negative number.`);
  }

  const hasLegs = Array.isArray(slip.legs) && slip.legs.length > 0;
  if (!hasLegs) {
    errors.push(`${prefix}: at least one leg is required.`);
  } else {
    if (slip.type === "single" && slip.legs.length !== 1) {
      errors.push(`${prefix}: a single must contain exactly one leg.`);
    }
    if (slip.type !== "single" && slip.legs.length < 2) {
      errors.push(`${prefix}: a multi-leg bet must contain at least two legs.`);
    }
    slip.legs.forEach((leg, index) => {
      for (const field of ["event", "market", "selection"]) {
        if (!isNonEmptyString(leg?.[field])) {
          errors.push(`${prefix}: leg ${index + 1} is missing ${field}.`);
        }
      }
    });
  }

  if (slip.result === "pending" && slipPnl(slip) !== null) {
    errors.push(`${prefix}: a pending slip generated P/L.`);
  }
  if (slip.result === "won" && slip.odds == null && slip.returnPts == null) {
    errors.push(`${prefix}: a winning slip needs odds or an exact returnPts value.`);
  }
  if (!validResults.has(slip.result) && isSettled(slip)) {
    errors.push(`${prefix}: an unknown result was treated as settled.`);
  }
}

const metrics = buildMetrics(slips);
const categoryMetrics = buildCategoryMetrics(slips);
const categoryTotal = categoryMetrics.reduce((sum, item) => sum + item.metrics.slips, 0);

if (categoryMetrics.length !== BET_CATEGORIES.length) {
  errors.push("Category metrics do not cover every configured bet category.");
}
if (categoryTotal !== slips.length) {
  errors.push("Every slip must belong to exactly one public bet category.");
}
if (metrics.calculable > metrics.settled) {
  errors.push("Calculable P/L count cannot exceed settled count.");
}
if (metrics.settled + metrics.pending !== metrics.slips) {
  errors.push("Settled and pending counts do not reconcile to total slips.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

if (slips.length === 0) {
  console.log(`Validated empty ${dashboardMeta.period} tracker shell.`);
} else {
  console.log(
    `Validated ${metrics.slips} slips / ${metrics.selections} selections: ` +
      `${metrics.wins}W ${metrics.losses}L ${metrics.voids}V ${metrics.pending} pending, ` +
      `${metrics.plPts.toFixed(2)}pts calculable P/L.`,
  );
}
