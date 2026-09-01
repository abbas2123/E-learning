import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../../features/admin/components/AdminSidebar";
import AdminHeader from "../../features/admin/components/AdminHeader";
import { useAdminNotifications } from "../../features/admin/hooks/useAdminNotifications";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notificationState = useAdminNotifications();

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Admin Navigation Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky Admin Header */}
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          notificationState={notificationState}
        />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Pass notification state to child pages via Outlet context */}
          <Outlet context={notificationState} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
