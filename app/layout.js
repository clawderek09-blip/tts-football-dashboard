import "./globals.css";

export const metadata = {
  title: "Football P&L Tracker | The Tipping Station",
  description:
    "Transparent month-by-month football results across pre-match singles, in-play bets, accumulators and bet builders.",
  icons: {
    icon: "/tts-football-logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
