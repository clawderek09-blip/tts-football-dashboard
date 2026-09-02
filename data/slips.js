/**
 * Live public dataset.
 *
 * September live tracker. Add only verified slips here once the source bet,
 * stake, price and result are accurate enough to publish.
 */
export const dashboardMeta = {
  brand: "The Tipping Station Football",
  period: "September 2026",
  periodShort: "Sep 2026",
  updatedAt: "2026-09-02T18:10:00Z",
  bankSize: 1000,
  pointValue: 10,
  currency: "GBP",
  trackingStatus: "live",
};

export const slips = [
  {
    id: "2026-09-01-btts-acca-001",
    date: "2026-09-01",
    time: "18:00",
    title: "BTTS Acca - 5 Selections",
    tipster: "The Tipping Station",
    type: "acca",
    timing: "pre-match",
    result: "lost",
    odds: 10.47,
    stakePts: 0.5,
    legs: [
      {
        event: "Boluspor v Ankara Keciorengucu",
        market: "BTTS",
        selection: "Yes",
      },
      {
        event: "West Ham v Wolverhampton",
        market: "BTTS",
        selection: "Yes",
      },
      {
        event: "Birmingham v Southampton",
        market: "BTTS",
        selection: "Yes",
      },
      {
        event: "Stoke v Norwich",
        market: "BTTS",
        selection: "Yes",
      },
      {
        event: "Huddersfield v Oxford Utd",
        market: "BTTS",
        selection: "Yes",
      },
    ],
  },
  {
    id: "2026-09-01-west-ham-wolves-builder-sot-001",
    date: "2026-09-01",
    time: "19:45",
    title: "West Ham v Wolverhampton Bet Builder - Shots On Target",
    tipster: "The Tipping Station",
    type: "builder",
    timing: "pre-match",
    result: "lost",
    odds: 5.0,
    stakePts: 0.5,
    legs: [
      {
        event: "West Ham v Wolverhampton",
        market: "Player Shots On Target",
        selection: "Jarrod Bowen 1+ shots on target",
      },
      {
        event: "West Ham v Wolverhampton",
        market: "Player Shots On Target",
        selection: "Pablo Felipe 1+ shots on target",
      },
      {
        event: "West Ham v Wolverhampton",
        market: "Player Shots On Target",
        selection: "Raul Jimenez 1+ shots on target",
      },
      {
        event: "West Ham v Wolverhampton",
        market: "Player Shots On Target",
        selection: "Mateus Mane 1+ shots on target",
      },
    ],
  },
  {
    id: "2026-09-01-west-ham-wolves-builder-goal-assist-001",
    date: "2026-09-01",
    time: "19:45",
    title: "West Ham v Wolverhampton Bet Builder - Score Or Assist",
    tipster: "The Tipping Station",
    type: "builder",
    timing: "pre-match",
    result: "lost",
    odds: 3.5,
    stakePts: 0.5,
    legs: [
      {
        event: "West Ham v Wolverhampton",
        market: "Player To Score Or Assist",
        selection: "Jarrod Bowen to score or assist",
      },
      {
        event: "West Ham v Wolverhampton",
        market: "Player To Score Or Assist",
        selection: "Raul Jimenez to score or assist",
      },
    ],
  },
  {
    id: "2026-09-02-mito-kashima-inplay-001",
    date: "2026-09-02",
    time: "10:00",
    title: "Mito Hollyhock v Kashima Antlers - 1st Half Goals",
    tipster: "The Tipping Station",
    type: "single",
    timing: "in-play",
    result: "won",
    odds: 1.4444444444,
    stakePts: 1,
    legs: [
      {
        event: "Mito Hollyhock v Kashima Antlers",
        market: "1st Half Goals",
        selection: "Over 1.5",
      },
    ],
  },
  {
    id: "2026-09-02-varazdin-sesvete-inplay-001",
    date: "2026-09-02",
    time: "10:00",
    title: "NK Varazdin U19 v NK Sesvete U19 - 1st Half Goals",
    tipster: "The Tipping Station",
    type: "single",
    timing: "in-play",
    result: "won",
    odds: 1.8,
    stakePts: 1,
    legs: [
      {
        event: "NK Varazdin U19 v NK Sesvete U19",
        market: "1st Half Goals",
        selection: "Over 0.5",
      },
    ],
  },
  {
    id: "2026-09-02-miedz-chrobry-inplay-001",
    date: "2026-09-02",
    time: "20:00",
    title: "Miedz Legnica v Chrobry Glogow - 1st Half Goals",
    tipster: "The Tipping Station",
    type: "single",
    timing: "in-play",
    result: "won",
    odds: 1.5714285714,
    stakePts: 1,
    confidence: "User-settled",
    legs: [
      {
        event: "Miedz Legnica v Chrobry Glogow",
        market: "1st Half Goals",
        selection: "Over 0.5",
      },
    ],
  },
  {
    id: "2026-09-02-malkiya-al-najma-inplay-001",
    date: "2026-09-02",
    time: "16:00",
    title: "Malkiya v Al-Najma Manama - Match Goals",
    tipster: "The Tipping Station",
    type: "single",
    timing: "in-play",
    result: "won",
    odds: 1.4444444444,
    stakePts: 1,
    legs: [
      {
        event: "Malkiya v Al-Najma Manama",
        market: "Match Goals",
        selection: "Over 0.5",
      },
    ],
  },
];
