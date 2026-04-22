import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

function getBreadcrumb(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "))
    .join(" › ");
}

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="app-header">
          <div className="text-sm text-neutral-500">
            {getBreadcrumb(location.pathname)}
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 text-primary-700 border border-primary-100 rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
              {user?.role?.replace("_", " ")}
            </div>
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
