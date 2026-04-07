import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((current) => !current)}
      />
      <main className={isCollapsed ? "ml-20 min-h-screen" : "ml-[200px] min-h-screen"}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
