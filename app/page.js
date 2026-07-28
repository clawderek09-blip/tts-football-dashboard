import FootballDashboard from "../components/FootballDashboard";
import { dashboardMeta, slips } from "../data/slips";

export default function HomePage() {
  return <FootballDashboard meta={dashboardMeta} slips={slips} />;
}
