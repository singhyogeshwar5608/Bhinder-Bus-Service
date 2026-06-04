"use client";

import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Bus,
  UserCog,
  Route,
  Clock,
  UserCheck,
  CreditCard,
  Tag,
  BarChart3,
  Settings,
  Headphones,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavStore, type PageKey } from "@/lib/nav-store";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarCheck,
  Bus,
  UserCog,
  Route,
  Clock,
  UserCheck,
  CreditCard,
  Tag,
  BarChart3,
  Settings,
};

const navItems: { label: string; icon: string; page: PageKey }[] = [
  { label: "Dashboard", icon: "LayoutDashboard", page: "dashboard" },
  { label: "Bookings", icon: "CalendarCheck", page: "bookings" },
  { label: "Buses", icon: "Bus", page: "buses" },
  { label: "Drivers", icon: "UserCog", page: "drivers" },
  { label: "Routes", icon: "Route", page: "routes" },
  { label: "Schedules", icon: "Clock", page: "schedules" },
  { label: "Travelers", icon: "UserCheck", page: "travelers" },
  { label: "Payments", icon: "CreditCard", page: "payments" },
  { label: "Coupons", icon: "Tag", page: "coupons" },
  { label: "Reports", icon: "BarChart3", page: "reports" },
  { label: "Settings", icon: "Settings", page: "settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { activePage, setActivePage } = useNavStore();
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleNavClick = (page: PageKey) => {
    setActivePage(page);
    navigate(`/admin/${page}`);
    onMobileClose(); // Close mobile sidebar on navigation
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logoutMutation.mutateAsync();
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        navigate("/"); // Redirect to home/login page
      } catch (error: any) {
        toast({
          title: "Logout Failed",
          description: error.response?.data?.message || "An error occurred during logout.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]",
          // Desktop
          "hidden lg:flex",
          collapsed ? "w-[72px]" : "w-[260px]",
          // Mobile
          mobileOpen && "flex lg:flex w-[260px]",
          !mobileOpen && !collapsed && "lg:flex"
        )}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "flex items-center gap-3 px-5 py-6 border-b border-white/10",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
                Bus Book CRM
              </h1>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ml-auto lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive = activePage === item.page;
              return (
                <li key={item.page}>
                  <button
                    onClick={() => handleNavClick(item.page)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {IconComponent && (
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                    )}
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Support Card */}
        {!collapsed && (
          <div className="px-3 mb-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-800/30 border border-blue-500/20 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Need Help?</p>
                  <p className="text-blue-300 text-xs">Contact Support</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="px-3 mb-3">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              "text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Logout" : ""}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 flex-shrink-0" />
            )}
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 pb-4">
            <p className="text-slate-500 text-xs text-center leading-tight">
              © 2024 Bus Book CRM
              <br />
              All rights reserved.
            </p>
          </div>
        )}

        {/* Collapse Toggle - Desktop only */}
        <div className="hidden lg:flex justify-end px-3 pb-4">
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
