import { Bell, Check, ExternalLink, ShieldAlert, UserPlus, DollarSign, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { useAdminNotifications } from "../hooks/useAdminNotifications";
import type { SystemNotification } from "../services/adminService";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notificationState: ReturnType<typeof useAdminNotifications>;
}

export default function NotificationDrawer({ isOpen, onClose, notificationState }: NotificationDrawerProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead } = notificationState;

  if (!isOpen) return null;

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
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case "user":
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-14 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No notifications.</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors hover:bg-slate-50 flex gap-3 ${
                  !item.read ? "bg-blue-50/40" : ""
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 shrink-0 h-fit">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              navigate("/admin/notifications");
              onClose();
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View all notifications <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
}
