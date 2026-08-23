import { useEffect, useState } from "react";
import { BookOpen, Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import wishlistService, { type WishlistItem } from "../../../services/wishlistService";

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then(setItems)
      .catch(() => toast.error("Failed to load wishlist."))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (courseId: string) => {
    setRemoving(courseId);
    try {
      await wishlistService.removeFromWishlist(courseId);
      setItems((prev) => prev.filter((i) => i.courseId !== courseId));
      toast.success("Removed from wishlist.");
    } catch {
      toast.error("Could not remove item.");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
          <Heart size={20} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Wishlist</h2>
          <p className="text-sm text-slate-500">
            {items.length === 0
              ? "No saved courses yet"
              : `${items.length} course${items.length > 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <BookOpen size={28} className="text-slate-400" />
          </div>
          <p className="font-medium text-slate-600">Your wishlist is empty</p>
          <p className="max-w-xs text-sm text-slate-400">
            Browse courses and save them here to review them later.
          </p>
          <button
            type="button"
            onClick={() => navigate("/course")}
            className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              {/* Thumbnail */}
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.courseTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen size={22} className="text-slate-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {item.courseTitle}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.category}</p>
                <p className="mt-1 text-sm font-bold text-indigo-600">
                  {item.price === 0 ? "Free" : `₹${item.price}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/course/${item.courseId}`)}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <ShoppingCart size={13} />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.courseId)}
                  disabled={removing === item.courseId}
                  className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {removing === item.courseId ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
