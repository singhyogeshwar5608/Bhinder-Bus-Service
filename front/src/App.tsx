import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Home as HomeIcon, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useNavStore, type PageKey } from "@/lib/nav-store";
import { cn } from "@/lib/utils";
import { LandingPage } from "@/components/landing/landing-page";
import { BookingPage } from "@/components/booking/booking-page";
import { PublicRoutesPage } from "@/components/routes/public-routes-page";
import { PublicBusesPage } from "@/components/buses/public-buses-page";
import { ScheduleDetailPage } from "@/components/schedule/schedule-detail-page";
import { AdminLoginModal } from "@/components/admin-login-modal";
import { Toaster } from "@/components/ui/toaster";

// Page components
import { DashboardPage } from "@/components/pages/dashboard-page";
import { BookingsPage } from "@/components/pages/bookings-page";
import { BusesPage } from "@/components/pages/buses-page";
import { RoutesPage } from "@/components/pages/routes-page";
import { TrackingPage } from "@/components/tracking/tracking-page";
import { SchedulesPage } from "@/components/pages/schedules-page";
import { TravelersPage } from "@/components/pages/travelers-page";
import { DriversPage } from "@/components/pages/drivers-page";
import { PaymentsPage } from "@/components/pages/payments-page";
import { CouponsPage } from "@/components/pages/coupons-page";
import { ReportsPage } from "@/components/pages/reports-page";
import { SettingsPage } from "@/components/pages/settings-page";

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  buses: "Buses",
  drivers: "Drivers",
  routes: "Routes",
  schedules: "Schedules",
  travelers: "Travelers",
  payments: "Payments",
  coupons: "Coupons",
  reports: "Reports",
  settings: "Settings",
};

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activePage, customTitle, customBreadcrumbs, hidePageHeader } = useNavStore();

  const pageTitle = customTitle || pageLabels[activePage] || "Admin";

  // Build breadcrumb items
  const breadcrumbItems = customBreadcrumbs || [
    { label: "Home", isActive: false },
    { label: pageLabels[activePage] || "Dashboard", isActive: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]")}>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-6 space-y-6">
          {!hidePageHeader && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <HomeIcon className="w-3.5 h-3.5 text-gray-400" />
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className={cn("text-xs font-medium", item.isActive ? "text-blue-600" : "text-gray-500")}>
                        {item.label}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><LandingPage /><AdminLoginModal /></>} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/routes" element={<PublicRoutesPage />} />
        <Route path="/buses" element={<PublicBusesPage />} />
        <Route path="/schedule/:id" element={<ScheduleDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="buses" element={<BusesPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          <Route path="travelers" element={<TravelersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
