import { Outlet } from "react-router-dom";
import { Sidebar } from "@/features/organisation/components/Sidebar";

const OrganisationLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default OrganisationLayout;
