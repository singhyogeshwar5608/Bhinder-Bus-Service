import { create } from "zustand";

export type PageKey =
  | "dashboard"
  | "bookings"
  | "buses"
  | "drivers"
  | "routes"
  | "schedules"
  | "travelers"
  | "payments"
  | "coupons"
  | "reports"
  | "settings";

export type AppView = "landing" | "admin" | "booking";

export interface BreadcrumbItem {
  label: string;
  isActive?: boolean;
}

interface NavState {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  customTitle: string | null;
  customBreadcrumbs: BreadcrumbItem[] | null;
  hidePageHeader: boolean;
  setCustomHeader: (title: string | null, breadcrumbs: BreadcrumbItem[] | null, hidePageHeader?: boolean) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activePage: "dashboard",
  setActivePage: (page) => set({ activePage: page, customTitle: null, customBreadcrumbs: null, hidePageHeader: false }),
  customTitle: null,
  customBreadcrumbs: null,
  hidePageHeader: false,
  setCustomHeader: (title, breadcrumbs, hidePageHeader = false) => set({ customTitle: title, customBreadcrumbs: breadcrumbs, hidePageHeader }),
  currentView: "landing",
  setCurrentView: (view) => set({ currentView: view }),
  showLoginModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show }),
}));
