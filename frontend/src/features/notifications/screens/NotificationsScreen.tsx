import { useEffect, useState } from "react";
import { Bell, CheckCheck, Info, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { adminService, type SystemNotification } from "../../admin/services/adminService";
import { toast } from "sonner";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await adminService.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark notifications read.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      case "payment":
        return <Info size={18} className="text-indigo-500" />;
      case "user":
        return <Bell size={18} className="text-amber-500" />;
      default:
        return <AlertCircle size={18} className="text-slate-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Notifications
            </h1>
            <p className="text-sm text-slate-500">
              Stay updated on course announcements, payments, and system updates.
            </p>
          </div>

          {notifications.some((n) => !n.read) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              <CheckCheck size={15} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-indigo-600" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You're all caught up! New updates regarding your courses and account will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                  n.read
                    ? "border-slate-200 bg-white"
                    : "border-indigo-200 bg-indigo-50/40 shadow-sm"
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100">
                  {getIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
