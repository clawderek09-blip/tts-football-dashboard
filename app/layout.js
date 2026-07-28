import "./globals.css";

export const metadata = {
  title: "The Tipping Station Football | July 2026 Results",
  description:
    "Verified July football results from The Tipping Station, covering singles, in-play bets, accas and multi-leg slips.",
  icons: {
    icon: "/tts-football-logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
