"use client";

import React from "react";
import { StatCards } from "@/components/dashboard/stat-cards";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PaymentsTable } from "@/components/dashboard/payments-table";

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <StatCards />

      {/* Filter Bar & Action Buttons */}
      <FilterBar />

      {/* Payments Table */}
      <PaymentsTable />
    </div>
  );
}
