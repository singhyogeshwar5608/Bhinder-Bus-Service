"use client";

import React from "react";
import {
  Download,
  SlidersHorizontal,
  Plus,
  Search,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onExport?: () => void;
  onFilter?: () => void;
  onNewRefund?: () => void;
}

export function FilterBar({ onExport, onFilter, onNewRefund }: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Payment Transactions</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
            onClick={onFilter}
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filters
          </Button>
          <Button
            size="sm"
            className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={onNewRefund}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Refund
          </Button>
        </div>
      </div>

      {/* Filter Inputs Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Payment Method */}
        <Select>
          <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
            <SelectItem value="netbanking">Net Banking</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select>
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <div className="relative">
          <input
            type="date"
            className="w-full sm:w-[170px] h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            defaultValue="2024-05-24"
          />
        </div>

        {/* Reset */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
