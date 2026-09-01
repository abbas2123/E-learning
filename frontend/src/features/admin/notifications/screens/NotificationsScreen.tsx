import { useOutletContext } from "react-router-dom";
import { Check, BookOpen, UserPlus, DollarSign, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { useAdminNotifications } from "../../hooks/useAdminNotifications";
import type { SystemNotification } from "../../services/adminService";

export default function NotificationsScreen() {
  // Consumes the shared notification state from AdminLayout via Outlet context
  const { notifications, unreadCount, markAllRead } =
    useOutletContext<ReturnType<typeof useAdminNotifications>>();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const getIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "approval":
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case "user":
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case "payment":
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Notification Center</h2>
          <p className="text-xs text-slate-500 mt-1">Platform alerts, approval requests, and user notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">No notifications yet.</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !item.read
                  ? "bg-white border-blue-200 shadow-xs ring-1 ring-blue-500/10"
                  : "bg-slate-50/50 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <p className="text-[11px] text-slate-400 pt-1">{item.createdAt}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
