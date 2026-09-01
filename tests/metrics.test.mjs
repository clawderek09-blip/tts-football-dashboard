import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCategoryMetrics,
  buildMetrics,
  categoryForSlip,
  filterSlips,
  slipPnl,
} from "../lib/metrics.js";

const fixtures = [
  {
    id: "single-win",
    date: "2026-09-01",
    time: "12:00",
    title: "Home win",
    tipster: "Test",
    type: "single",
    timing: "pre-match",
    result: "won",
    odds: 2.5,
    stakePts: 1,
    legs: [{ event: "Alpha v Beta", market: "Match result", selection: "Alpha" }],
  },
  {
    id: "live-loss",
    date: "2026-09-02",
    time: "15:30",
    title: "Next goal",
    tipster: "Test",
    type: "single",
    timing: "in-play",
    result: "lost",
    odds: null,
    stakePts: 2,
    legs: [{ event: "Gamma v Delta", market: "Next goal", selection: "Gamma" }],
  },
  {
    id: "acca-void",
    date: "2026-09-03",
    time: "10:15",
    title: "Weekend double",
    tipster: "Test",
    type: "acca",
    timing: "pre-match",
    result: "void",
    odds: null,
    stakePts: 1,
    legs: [
      { event: "A v B", market: "Match result", selection: "A" },
      { event: "C v D", market: "Match result", selection: "C" },
    ],
  },
  {
    id: "builder-pending",
    date: "2026-09-04",
    time: "19:45",
    title: "Monday builder",
    tipster: "Test",
    type: "builder",
    timing: "pre-match",
    result: "pending",
    odds: 3.2,
    stakePts: 1,
    legs: [
      { event: "E v F", market: "Goals", selection: "Over 2.5" },
      { event: "E v F", market: "Corners", selection: "Over 8.5" },
    ],
  },
];

test("empty metrics use null for rates without denominators", () => {
  const metrics = buildMetrics([]);
  assert.equal(metrics.slips, 0);
  assert.equal(metrics.roi, null);
  assert.equal(metrics.strikeRate, null);
  assert.deepEqual(metrics.daily, []);
});

test("P/L is calculable for losses and voids without prices", () => {
  assert.equal(slipPnl(fixtures[0]), 1.5);
  assert.equal(slipPnl(fixtures[1]), -2);
  assert.equal(slipPnl(fixtures[2]), 0);
  assert.equal(slipPnl(fixtures[3]), null);
});

test("metrics reconcile stake, returns, P/L and decision-only strike rate", () => {
  const metrics = buildMetrics(fixtures);
  assert.equal(metrics.slips, 4);
  assert.equal(metrics.selections, 6);
  assert.equal(metrics.settled, 3);
  assert.equal(metrics.calculable, 3);
  assert.equal(metrics.stakePts, 4);
  assert.equal(metrics.returnPts, 3.5);
  assert.equal(metrics.plPts, -0.5);
  assert.equal(metrics.roi, -0.125);
  assert.equal(metrics.strikeRate, 0.5);
});

test("public categories are exclusive and exhaustive", () => {
  assert.deepEqual(fixtures.map(categoryForSlip), ["single", "in-play", "acca", "builder"]);
  const categories = buildCategoryMetrics(fixtures);
  assert.deepEqual(categories.map((item) => item.metrics.slips), [1, 1, 1, 1]);
});

test("log filters search, status and sort independently", () => {
  assert.deepEqual(
    filterSlips(fixtures, { category: "in-play" }).map((slip) => slip.id),
    ["live-loss"],
  );
  assert.deepEqual(
    filterSlips(fixtures, { status: "settled", sort: "oldest" }).map((slip) => slip.id),
    ["single-win", "live-loss", "acca-void"],
  );
  assert.deepEqual(
    filterSlips(fixtures, { query: "corners" }).map((slip) => slip.id),
    ["builder-pending"],
  );
});
