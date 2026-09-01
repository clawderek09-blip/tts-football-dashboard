export const SETTLED_RESULTS = new Set(["won", "lost", "void"]);

export const BET_CATEGORIES = [
  {
    id: "single",
    number: "01",
    label: "Pre-match singles",
    shortLabel: "Singles",
    descriptor: "One selection",
    description: "Straight match or player markets placed before kick-off.",
  },
  {
    id: "in-play",
    number: "02",
    label: "In-play",
    shortLabel: "In-play",
    descriptor: "Live markets",
    description: "Bets shared after kick-off, kept separate from pre-match calls.",
  },
  {
    id: "acca",
    number: "03",
    label: "Accumulators",
    shortLabel: "Accas",
    descriptor: "Multiple matches",
    description: "Selections across multiple fixtures settled as one slip.",
  },
  {
    id: "builder",
    number: "04",
    label: "Bet builders",
    shortLabel: "Builders",
    descriptor: "Same-match multiples",
    description: "Several markets from one fixture combined into a single bet.",
  },
];

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function isSettled(slip) {
  return SETTLED_RESULTS.has(slip?.result);
}

export function slipPnl(slip) {
  if (!slip || !isSettled(slip) || !finiteNumber(slip.stakePts)) return null;

  if (finiteNumber(slip.returnPts)) {
    return slip.returnPts - slip.stakePts;
  }

  if (slip.result === "lost") return -slip.stakePts;
  if (slip.result === "void") return 0;
  if (slip.result === "won" && finiteNumber(slip.odds)) {
    return (slip.odds - 1) * slip.stakePts;
  }

  return null;
}

export function categoryForSlip(slip) {
  if (slip?.timing === "in-play") return "in-play";
  if (slip?.type === "single") return "single";
  if (slip?.type === "acca") return "acca";
  if (slip?.type === "builder") return "builder";
  return "other";
}

function matchesQuery(slip, query) {
  const needle = query.trim().toLocaleLowerCase("en-GB");
  if (!needle) return true;

  const searchable = [
    slip.title,
    slip.tipster,
    slip.date,
    slip.type,
    slip.timing,
    ...slip.legs.flatMap((leg) => [leg.event, leg.market, leg.selection]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en-GB");

  return searchable.includes(needle);
}

export function filterSlips(
  slips,
  { category = "all", status = "all", query = "", sort = "newest" } = {},
) {
  const filtered = slips.filter((slip) => {
    if (category !== "all" && categoryForSlip(slip) !== category) return false;
    if (status === "settled" && !isSettled(slip)) return false;
    if (status !== "all" && status !== "settled" && slip.result !== status) {
      return false;
    }
    return matchesQuery(slip, query);
  });

  return filtered.sort((a, b) => {
    const comparison = `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
    return sort === "oldest" ? comparison : -comparison;
  });
}

export function buildMetrics(slips) {
  const settled = slips.filter(isSettled);
  const calculable = settled.filter((slip) => slipPnl(slip) !== null);
  const wins = settled.filter((slip) => slip.result === "won").length;
  const losses = settled.filter((slip) => slip.result === "lost").length;
  const voids = settled.filter((slip) => slip.result === "void").length;
  const pending = slips.filter((slip) => slip.result === "pending").length;
  const decisions = wins + losses;
  const selections = slips.reduce((sum, slip) => sum + slip.legs.length, 0);
  const stakePts = calculable.reduce((sum, slip) => sum + slip.stakePts, 0);
  const plPts = calculable.reduce((sum, slip) => sum + slipPnl(slip), 0);
  const returnPts = stakePts + plPts;

  const byDayMap = new Map();
  [...calculable]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .forEach((slip) => {
      if (!byDayMap.has(slip.date)) {
        byDayMap.set(slip.date, {
          date: slip.date,
          slips: 0,
          stakePts: 0,
          plPts: 0,
        });
      }
      const day = byDayMap.get(slip.date);
      day.slips += 1;
      day.stakePts += slip.stakePts;
      day.plPts += slipPnl(slip);
    });

  let runningPts = 0;
  const daily = [...byDayMap.values()].map((day) => {
    runningPts += day.plPts;
    return {
      ...day,
      runningPts,
      roi: day.stakePts ? day.plPts / day.stakePts : null,
    };
  });

  const marketCounts = new Map();
  slips.forEach((slip) => {
    slip.legs.forEach((leg) => {
      marketCounts.set(leg.market, (marketCounts.get(leg.market) || 0) + 1);
    });
  });

  const marketMix = [...marketCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    slips: slips.length,
    selections,
    settled: settled.length,
    calculable: calculable.length,
    missingPnl: settled.length - calculable.length,
    wins,
    losses,
    voids,
    pending,
    stakePts,
    returnPts,
    plPts,
    roi: stakePts ? plPts / stakePts : null,
    strikeRate: decisions ? wins / decisions : null,
    daily,
    marketMix,
  };
}

export function buildCategoryMetrics(slips) {
  return BET_CATEGORIES.map((category) => ({
    ...category,
    metrics: buildMetrics(
      slips.filter((slip) => categoryForSlip(slip) === category.id),
    ),
  }));
}
