"use client";

import React from "react";
import {
  IndianRupee,
  CheckCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  IndianRupee,
  CheckCircle,
  RotateCcw,
  XCircle,
};

const cards = [
  {
    title: "Total Payments",
    amount: "₹12,45,600",
    subtitle: "All time collection",
    icon: "IndianRupee",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Successful Payments",
    amount: "₹11,32,890",
    subtitle: "91.0% of total payments",
    icon: "CheckCircle",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Refunds Processed",
    amount: "₹78,450",
    subtitle: "6.3% of total payments",
    icon: "RotateCcw",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Failed Payments",
    amount: "₹34,260",
    subtitle: "2.7% of total payments",
    icon: "XCircle",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card) => {
        const IconComponent = iconMap[card.icon];
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {card.amount}
                </p>
                <p className="text-xs text-gray-400">{card.subtitle}</p>
              </div>
              <div
                className={cn(
                  "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0",
                  card.iconBg
                )}
              >
                {IconComponent && (
                  <IconComponent className={cn("w-5 h-5", card.iconColor)} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
