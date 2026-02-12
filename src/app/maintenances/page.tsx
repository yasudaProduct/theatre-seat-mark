import TheaterMaintenance from "@/components/TheaterMaintenance";
import TheaterScraper from "@/components/TheaterScraper";

export default function MaintenancesPage() {
  return (
    <div className="space-y-6">
      <TheaterScraper />
      <TheaterMaintenance />
    </div>
  );
}
