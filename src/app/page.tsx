import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/data";

export default function Home() {
  return <Dashboard initialData={getDashboardData("30d")} />;
}
