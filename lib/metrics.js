export function slipPnl(slip) {
  if (slip.result === "pending" || slip.odds == null) return null;
  if (slip.result === "void") return 0;
  if (slip.result === "won") return (slip.odds - 1) * slip.stakePts;
  return -slip.stakePts;
}

export function buildMetrics(slips) {
  const priced = slips.filter((slip) => slipPnl(slip) !== null);
  const settled = slips.filter((slip) => slip.result !== "pending");
  const wins = settled.filter((slip) => slip.result === "won").length;
  const losses = settled.filter((slip) => slip.result === "lost").length;
  const voids = settled.filter((slip) => slip.result === "void").length;
  const pending = slips.length - settled.length;
  const selections = slips.reduce((sum, slip) => sum + slip.legs.length, 0);
  const stakePts = priced.reduce((sum, slip) => sum + slip.stakePts, 0);
  const returnPts = priced.reduce((sum, slip) => {
    if (slip.result === "won") return sum + slip.odds * slip.stakePts;
    if (slip.result === "void") return sum + slip.stakePts;
    return sum;
  }, 0);
  const plPts = priced.reduce((sum, slip) => sum + slipPnl(slip), 0);

  const byDayMap = new Map();
  [...slips]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .forEach((slip) => {
      if (!byDayMap.has(slip.date)) {
        byDayMap.set(slip.date, {
          date: slip.date,
          slips: 0,
          settled: 0,
          priced: 0,
          plPts: 0,
        });
      }
      const day = byDayMap.get(slip.date);
      day.slips += 1;
      if (slip.result !== "pending") day.settled += 1;
      const pnl = slipPnl(slip);
      if (pnl !== null) {
        day.priced += 1;
        day.plPts += pnl;
      }
    });

  let runningPts = 0;
  const daily = [...byDayMap.values()].map((day) => {
    runningPts += day.plPts;
    return { ...day, runningPts };
  });

  const marketCounts = new Map();
  slips.forEach((slip) => {
    slip.legs.forEach((leg) => {
      marketCounts.set(leg.market, (marketCounts.get(leg.market) || 0) + 1);
    });
  });

  const marketMix = [...marketCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    slips: slips.length,
    selections,
    settled: settled.length,
    priced: priced.length,
    wins,
    losses,
    voids,
    pending,
    stakePts,
    returnPts,
    plPts,
    roi: stakePts ? plPts / stakePts : 0,
    strikeRate: settled.length ? wins / settled.length : 0,
    daily,
    marketMix,
  };
}
