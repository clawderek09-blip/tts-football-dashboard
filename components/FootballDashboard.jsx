"use client";

import { useMemo, useState } from "react";
import { buildMetrics, slipPnl } from "../lib/metrics";

const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-GB", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const decimalFormatter = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function signedPoints(value) {
  if (value == null) return "—";
  const number = Number(value);
  return `${number >= 0 ? "+" : "−"}${decimalFormatter.format(Math.abs(number))} pts`;
}

function money(value) {
  return moneyFormatter.format(Number(value || 0));
}

function signedMoney(value) {
  if (value == null) return "—";
  const number = Number(value);
  return `${number >= 0 ? "+" : "−"}${money(Math.abs(number))}`;
}

function percent(value) {
  return value == null ? "—" : percentFormatter.format(value);
}

function humanDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00Z`));
}

function titleCase(value) {
  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ProfitChart({ daily }) {
  const width = 820;
  const height = 270;
  const left = 58;
  const right = 22;
  const top = 24;
  const bottom = 48;
  const values = [0, ...daily.map((day) => day.runningPts)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.24, 0.5);
  const chartMin = min - padding;
  const chartMax = max + padding;
  const xFor = (index) =>
    left + (index / Math.max(daily.length - 1, 1)) * (width - left - right);
  const yFor = (value) =>
    top +
    ((chartMax - value) / Math.max(chartMax - chartMin, 1)) *
      (height - top - bottom);
  const points = daily
    .map((day, index) => `${xFor(index)},${yFor(day.runningPts)}`)
    .join(" ");
  const zeroY = yFor(0);
  const area = daily.length
    ? `${xFor(0)},${zeroY} ${points} ${xFor(daily.length - 1)},${zeroY}`
    : "";
  const tickValues = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return chartMax - ratio * (chartMax - chartMin);
  });

  return (
    <svg
      className="profit-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Cumulative profit and loss from priced settled slips"
    >
      <defs>
        <linearGradient id="footballLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff203f" />
          <stop offset="54%" stopColor="#ffcc44" />
          <stop offset="100%" stopColor="#00e4ff" />
        </linearGradient>
        <linearGradient id="footballArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 32, 63, .28)" />
          <stop offset="100%" stopColor="rgba(0, 228, 255, .02)" />
        </linearGradient>
      </defs>

      {tickValues.map((tick) => (
        <g key={tick}>
          <line
            x1={left}
            y1={yFor(tick)}
            x2={width - right}
            y2={yFor(tick)}
            stroke="rgba(255,255,255,.09)"
          />
          <text
            x={left - 12}
            y={yFor(tick) + 4}
            fill="rgba(255,255,255,.5)"
            fontSize="12"
            textAnchor="end"
          >
            {tick > 0 ? "+" : ""}
            {tick.toFixed(1)}
          </text>
        </g>
      ))}

      <line
        x1={left}
        y1={zeroY}
        x2={width - right}
        y2={zeroY}
        stroke="rgba(255,255,255,.32)"
        strokeDasharray="5 8"
      />
      <polygon points={area} fill="url(#footballArea)" />
      <polyline
        points={points}
        fill="none"
        stroke="url(#footballLine)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {daily.map((day, index) => (
        <g key={day.date}>
          <circle
            cx={xFor(index)}
            cy={yFor(day.runningPts)}
            r="5"
            fill={day.plPts >= 0 ? "#6cff64" : "#ff203f"}
            stroke="#020202"
            strokeWidth="2"
          >
            <title>{`${humanDate(day.date)}: ${signedPoints(day.runningPts)} running`}</title>
          </circle>
          <text
            x={xFor(index)}
            y={height - 17}
            fill="rgba(255,255,255,.54)"
            fontSize="12"
            textAnchor={
              index === 0 ? "start" : index === daily.length - 1 ? "end" : "middle"
            }
          >
            {humanDate(day.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function KpiCard({ label, value, note, tone = "cyan" }) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function BreakdownRows({ items, total, unit = "selections" }) {
  if (!total) {
    return (
      <div className="empty-state">
        <strong>No verified data yet.</strong>
      </div>
    );
  }

  return (
    <div className="breakdown-list">
      {items.map((item) => (
        <div className="breakdown-row" key={item.name}>
          <div>
            <strong>{item.name}</strong>
            <span>
              {item.count} {unit}
            </span>
          </div>
          <div className="breakdown-meter" aria-hidden="true">
            <i style={{ width: `${Math.max(4, (item.count / total) * 100)}%` }} />
          </div>
          <b>{percentFormatter.format(item.count / total)}</b>
        </div>
      ))}
    </div>
  );
}

function SlipCard({ slip, pointValue }) {
  const pnl = slipPnl(slip);

  return (
    <details className="slip-card">
      <summary>
        <div className="slip-date">
          <strong>{humanDate(slip.date)}</strong>
          <span>{slip.time}</span>
        </div>
        <div className="slip-main">
          <div className="slip-tags">
            <span>{titleCase(slip.type)}</span>
            <span>{titleCase(slip.timing)}</span>
            {slip.confidence ? <span className="tag-risk">{slip.confidence}</span> : null}
          </div>
          <strong>{slip.title}</strong>
          <small>
            {slip.legs.length} {slip.legs.length === 1 ? "selection" : "legs"} ·{" "}
            {slip.odds ? `${slip.odds.toFixed(2)} odds` : "odds TBC"}
          </small>
        </div>
        <div className={`result-block result-${slip.result}`}>
          <span>{titleCase(slip.result)}</span>
          <strong>
            {pnl === null ? "TBC" : signedPoints(pnl)}
          </strong>
          {pnl !== null ? <small>{signedMoney(pnl * pointValue)}</small> : null}
        </div>
        <span className="expand-icon" aria-hidden="true">+</span>
      </summary>

      <div className="slip-detail">
        <div className="leg-list">
          {slip.legs.map((leg, index) => (
            <div className="leg-row" key={`${slip.id}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{leg.selection}</strong>
                <small>
                  {leg.event} · {leg.market}
                </small>
              </div>
            </div>
          ))}
        </div>
        {slip.odds == null ? (
          <div className="source-note">
            <span className="source-warning">P/L excluded until the original price is verified.</span>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export default function FootballDashboard({ meta, slips }) {
  const [filter, setFilter] = useState("all");
  const metrics = useMemo(() => buildMetrics(slips), [slips]);
  const periodName = meta.period.split(/\s+/)[0];
  const filters = [
    { id: "all", label: "All slips" },
    { id: "single", label: "Singles" },
    { id: "acca", label: "Accas" },
    { id: "builder", label: "Bet builders" },
    { id: "in-play", label: "In-play" },
    { id: "settled", label: "Settled" },
  ];

  const filteredSlips = useMemo(() => {
    return [...slips]
      .filter((slip) => {
        if (filter === "all") return true;
        if (filter === "in-play") return slip.timing === "in-play";
        if (filter === "settled") return slip.result !== "pending";
        return slip.type === filter;
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [filter, slips]);

  const slipFormats = [
    { name: "Singles", count: slips.filter((slip) => slip.type === "single").length },
    { name: "Accas", count: slips.filter((slip) => slip.type === "acca").length },
    { name: "Bet Builders", count: slips.filter((slip) => slip.type === "builder").length },
  ];
  const bestDay = [...metrics.daily].sort((a, b) => b.plPts - a.plPts)[0];
  const bestWinningSlip = [...slips]
    .filter((slip) => slip.result === "won" && slipPnl(slip) !== null)
    .sort((a, b) => slipPnl(b) - slipPnl(a))[0];
  const wonDegrees = metrics.settled
    ? (metrics.wins / metrics.settled) * 360
    : 0;
  const lostDegrees = metrics.settled
    ? ((metrics.wins + metrics.losses) / metrics.settled) * 360
    : 0;

  return (
    <main className="dashboard-shell">
      <section className="hero">
        <div className="hero-watermark" aria-hidden="true">
          TTS
        </div>
        <div className="hero-inner">
          <div className="brand-row">
            <img
              className="brand-mark"
              src="/tts-football-logo.jpg"
              alt="The Tipping Station Football logo"
            />
            <div>
              <p className="eyebrow">Welcome to</p>
              <p className="brand-name">{meta.brand}</p>
            </div>
          </div>

          <div className="hero-title">
            <p className="hero-kicker">Football P&amp;L tracker</p>
            <h1>
              {periodName} results
              <br />
              dashboard
            </h1>
            <p>
              Singles, in-play calls, accas and multi-leg football bets.
            </p>
          </div>

          <div className="hero-meta">
            <span className="pill red">{meta.period}</span>
            <span className="pill gold">{money(meta.bankSize)} bank</span>
            <span className="pill">1pt = {money(meta.pointValue)}</span>
            {meta.updatedAt ? <span className="pill">Updated {meta.updatedAt}</span> : null}
          </div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="section-number">01</span>
          <h2>{periodName} performance</h2>
        </div>
        <span>{meta.period} · awaiting verified bets</span>
      </section>

      <section className="kpi-grid">
        <KpiCard
          label="Priced P/L"
          value={metrics.calculable ? signedPoints(metrics.plPts) : "—"}
          note={
            metrics.calculable
              ? `${signedMoney(metrics.plPts * meta.pointValue)} · ${metrics.calculable} priced settlements`
              : "No calculable settlements yet"
          }
          tone={metrics.calculable && metrics.plPts < 0 ? "red" : "green"}
        />
        <KpiCard
          label="ROI"
          value={percent(metrics.roi)}
          note={
            metrics.calculable
              ? `${decimalFormatter.format(metrics.stakePts)} pts calculable stake`
              : "Begins after the first settled stake"
          }
          tone="cyan"
        />
        <KpiCard
          label="Slip Strike Rate"
          value={percent(metrics.strikeRate)}
          note={
            metrics.wins + metrics.losses
              ? `${metrics.wins} wins from ${metrics.wins + metrics.losses} decisions`
              : "Begins after the first win or loss"
          }
          tone="gold"
        />
        <KpiCard
          label="Tracked Slips"
          value={metrics.slips ? String(metrics.slips) : "—"}
          note={
            metrics.slips
              ? `${metrics.settled} settled · ${metrics.pending} pending`
              : "No verified bets recorded yet"
          }
          tone="red"
        />
      </section>

      <section className="section-heading">
        <div>
          <span className="section-number">02</span>
          <h2>Profit curve</h2>
        </div>
        <span>Priced bets only · no invented odds</span>
      </section>

      <section className="visual-grid">
        <article className="chart-panel">
          <div className="panel-top">
            <div>
              <p className="panel-eyebrow">Running performance</p>
              <h3>Cumulative P/L</h3>
              {metrics.calculable ? (
                <p>{`Verified prices currently return ${signedPoints(metrics.plPts)} from ${metrics.calculable} settled slips.`}</p>
              ) : null}
            </div>
            <span className="pill cyan">
              {metrics.calculable ? signedPoints(metrics.plPts) : "—"}
            </span>
          </div>
          <div className="chart-wrap">
            {metrics.daily.length ? (
              <ProfitChart daily={metrics.daily} />
            ) : (
              <div className="empty-state">
                <strong>No P/L curve yet.</strong>
              </div>
            )}
          </div>
        </article>

        <article
          className="split-panel"
          style={{
            "--won-deg": `${wonDegrees}deg`,
            "--lost-deg": `${lostDegrees}deg`,
          }}
        >
          <div className="panel-top">
            <div>
              <p className="panel-eyebrow">Settled slips</p>
              <h3>Result split</h3>
            </div>
          </div>
          <div className="result-ring">
            <div>
              <strong>{metrics.settled}</strong>
              <span>settled</span>
            </div>
          </div>
          <div className="legend">
            <div><span><i className="dot-win" />Won</span><strong>{metrics.wins}</strong></div>
            <div><span><i className="dot-loss" />Lost</span><strong>{metrics.losses}</strong></div>
            <div><span><i className="dot-void" />Void</span><strong>{metrics.voids}</strong></div>
            <div><span><i className="dot-pending" />Pending</span><strong>{metrics.pending}</strong></div>
          </div>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <span className="section-number">03</span>
          <h2>Sharpest spots</h2>
        </div>
        <span>Current verified sample</span>
      </section>

      <section className="proof-grid">
        <article className="proof-card">
          <span>Best priced day</span>
          <strong className="positive">
            {bestDay ? signedPoints(bestDay.plPts) : "—"}
          </strong>
          <p>
            {bestDay
              ? `${humanDate(bestDay.date)} · ${bestDay.slips} priced slips`
              : "No priced results yet."}
          </p>
        </article>
        <article className="proof-card">
          <span>Best winning bet</span>
          <strong className={bestWinningSlip ? "positive" : undefined}>
            {bestWinningSlip ? signedPoints(slipPnl(bestWinningSlip)) : "—"}
          </strong>
          <p>
            {bestWinningSlip
              ? `${titleCase(bestWinningSlip.timing === "in-play" ? "in-play" : bestWinningSlip.type)} · ${bestWinningSlip.title}`
              : "No winning bets yet."}
          </p>
          <p>
            {metrics.slips
              ? `${metrics.wins} wins from ${metrics.slips} bets`
              : "Wins will update as bets settle."}
          </p>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <span className="section-number">04</span>
          <h2>Bet breakdowns</h2>
        </div>
        <span>Slip formats and football markets</span>
      </section>

      <section className="rank-grid">
        <article className="rank-panel">
          <div className="panel-top">
            <div>
              <p className="panel-eyebrow">Flexible slip model</p>
              <h3>Bet format</h3>
              <p>Singles, accas and same-game builders share one expandable format.</p>
            </div>
          </div>
          <BreakdownRows items={slipFormats} total={metrics.slips} unit="slips" />
        </article>

        <article className="rank-panel">
          <div className="panel-top">
            <div>
              <p className="panel-eyebrow">All recorded legs</p>
              <h3>Market mix</h3>
              <p>Selections grouped by market rather than forced into one bet type.</p>
            </div>
          </div>
          <BreakdownRows
            items={metrics.marketMix.slice(0, 6)}
            total={metrics.selections}
          />
        </article>
      </section>

      <section className="section-heading">
        <div>
          <span className="section-number">05</span>
          <h2>Verified slip log</h2>
        </div>
        <span>Expand any slip to inspect every leg</span>
      </section>

      <section className="log-panel">
        <div className="filter-row" aria-label="Filter betting slips">
          {filters.map((item) => {
            const count = slips.filter((slip) => {
              if (item.id === "all") return true;
              if (item.id === "in-play") return slip.timing === "in-play";
              if (item.id === "settled") return slip.result !== "pending";
              return slip.type === item.id;
            }).length;
            return (
              <button
                type="button"
                key={item.id}
                className={filter === item.id ? "active" : ""}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="slip-list">
          {filteredSlips.length ? (
            filteredSlips.map((slip) => (
              <SlipCard key={slip.id} slip={slip} pointValue={meta.pointValue} />
            ))
          ) : (
            <div className="empty-state">
              <strong>No verified bets recorded for {periodName} yet.</strong>
              <p>The selected view will populate automatically when accurate slips are added.</p>
            </div>
          )}
        </div>
      </section>

      <footer>
        <img src="/tts-football-logo.jpg" alt="" />
        <div>
          <strong>{meta.brand}</strong>
          <p>Results tracking only. 18+ · Please gamble responsibly.</p>
        </div>
        <span>Only verified bets will be published</span>
      </footer>
    </main>
  );
}
