import React from "react";
import { ArmarioWidget } from "@/components/dashboard/ArmarioWidget";
import { AulasGrid } from "@/components/dashboard/AulasGrid";
import { EventosCarousel } from "@/components/dashboard/EventosCarousel";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:gap-7 lg:grid-cols-12 [&>*]:min-w-0">
      <div className="lg:col-span-12">
        <WelcomeBanner />
      </div>

      <div className="lg:col-span-12">
        <AulasGrid />
      </div>

      <div className="lg:col-span-7">
        <EventosCarousel />
      </div>

      <div className="lg:col-span-5">
        <ArmarioWidget />
      </div>
    </div>
  );
}
