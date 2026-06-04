"use client";

import React, { useState } from "react";
import { Eye, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PaymentRecord {
  id: string;
  transactionId: string;
  bookingId: string;
  user: { name: string; email: string };
  amount: number;
  paymentMethod: "UPI" | "Card" | "Wallet" | "Net Banking" | "Cash";
  status: "Success" | "Pending" | "Failed" | "Refunded";
  paymentDate: string;
}

const paymentsData: PaymentRecord[] = [
  {
    id: "1",
    transactionId: "TXN20240524001",
    bookingId: "BK-2024-0845",
    user: { name: "Rahul Sharma", email: "rahul@email.com" },
    amount: 1250,
    paymentMethod: "UPI",
    status: "Success",
    paymentDate: "24 May 2024, 10:30 AM",
  },
  {
    id: "2",
    transactionId: "TXN20240524002",
    bookingId: "BK-2024-0846",
    user: { name: "Priya Patel", email: "priya@email.com" },
    amount: 890,
    paymentMethod: "Card",
    status: "Success",
    paymentDate: "24 May 2024, 11:15 AM",
  },
  {
    id: "3",
    transactionId: "TXN20240524003",
    bookingId: "BK-2024-0847",
    user: { name: "Amit Kumar", email: "amit@email.com" },
    amount: 2100,
    paymentMethod: "Net Banking",
    status: "Pending",
    paymentDate: "24 May 2024, 12:00 PM",
  },
  {
    id: "4",
    transactionId: "TXN20240524004",
    bookingId: "BK-2024-0848",
    user: { name: "Sneha Reddy", email: "sneha@email.com" },
    amount: 560,
    paymentMethod: "Wallet",
    status: "Failed",
    paymentDate: "24 May 2024, 01:45 PM",
  },
  {
    id: "5",
    transactionId: "TXN20240524005",
    bookingId: "BK-2024-0849",
    user: { name: "Vikram Singh", email: "vikram@email.com" },
    amount: 1780,
    paymentMethod: "UPI",
    status: "Success",
    paymentDate: "24 May 2024, 02:30 PM",
  },
  {
    id: "6",
    transactionId: "TXN20240524006",
    bookingId: "BK-2024-0850",
    user: { name: "Anjali Gupta", email: "anjali@email.com" },
    amount: 950,
    paymentMethod: "Card",
    status: "Refunded",
    paymentDate: "24 May 2024, 03:15 PM",
  },
  {
    id: "7",
    transactionId: "TXN20240524007",
    bookingId: "BK-2024-0851",
    user: { name: "Karthik Nair", email: "karthik@email.com" },
    amount: 3200,
    paymentMethod: "Net Banking",
    status: "Success",
    paymentDate: "24 May 2024, 04:00 PM",
  },
  {
    id: "8",
    transactionId: "TXN20240524008",
    bookingId: "BK-2024-0852",
    user: { name: "Meera Joshi", email: "meera@email.com" },
    amount: 670,
    paymentMethod: "Cash",
    status: "Success",
    paymentDate: "24 May 2024, 04:45 PM",
  },
  {
    id: "9",
    transactionId: "TXN20240523009",
    bookingId: "BK-2024-0853",
    user: { name: "Ravi Verma", email: "ravi@email.com" },
    amount: 1450,
    paymentMethod: "UPI",
    status: "Pending",
    paymentDate: "23 May 2024, 09:30 AM",
  },
  {
    id: "10",
    transactionId: "TXN20240523010",
    bookingId: "BK-2024-0854",
    user: { name: "Deepa Iyer", email: "deepa@email.com" },
    amount: 2340,
    paymentMethod: "Card",
    status: "Success",
    paymentDate: "23 May 2024, 10:15 AM",
  },
];

const statusStyles: Record<string, string> = {
  Success: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  Pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  Failed: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  Refunded: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50",
};

const paymentMethodIcons: Record<string, string> = {
  UPI: "📱",
  Card: "💳",
  Wallet: "👛",
  "Net Banking": "🏦",
  Cash: "💵",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PaymentsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                Transaction ID
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                Booking ID
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                User
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                Payment Method
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                Payment Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.map((payment) => (
              <TableRow
                key={payment.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <TableCell className="py-3.5 px-4">
                  <span className="text-sm font-medium text-gray-800">
                    {payment.transactionId}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <span className="text-sm text-gray-600">
                    {payment.bookingId}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-semibold">
                        {getInitials(payment.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-tight">
                        {payment.user.name}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight">
                        {payment.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">
                      {paymentMethodIcons[payment.paymentMethod]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {payment.paymentMethod}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                      statusStyles[payment.status]
                    )}
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <span className="text-sm text-gray-500">
                    {payment.paymentDate}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100 gap-3">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">1</span> to{" "}
          <span className="font-medium text-gray-700">10</span> of{" "}
          <span className="font-medium text-gray-700">48</span> payments
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-200"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {[1, 2, 3, 4, 5].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 text-sm",
                currentPage === page
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-200"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
