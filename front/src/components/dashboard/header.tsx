"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, ChevronDown, LogOut, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const admin = useAuthStore((state) => state.admin);
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logoutMutation.mutateAsync();
      toast({ title: "Logged Out", description: "You have been logged out." });
      navigate("/");
    } catch {
      toast({ title: "Logout Failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200/80">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left - Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-500 hover:text-gray-700"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for buses, routes, bookings, users..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
          </div>
        </div>

        {/* Right - Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src="" alt="Admin" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{admin?.email || "admin@example.com"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-xl py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{admin?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">{admin?.email || ""}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
