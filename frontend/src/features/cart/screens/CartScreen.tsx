import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { cartService, type CartItem } from "../../../services/cartService";
import { toast } from "sonner";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function CartScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartService.getCart());
  }, []);

  const handleRemove = (courseId: string) => {
    const updated = cartService.removeFromCart(courseId);
    setItems(updated);
    toast.success("Removed from cart.");
  };

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);

  const handleProceedToCheckout = () => {
    if (items.length === 1) {
      // Single course: use existing single-course checkout flow
      navigate(`/checkout?courseId=${items[0].courseId}`);
    } else {
      // Multi-course: pass all courseIds
      const ids = items.map((i) => i.courseId).join(",");
      navigate(`/checkout?courseIds=${ids}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length === 0
              ? "Your cart is empty"
              : `${items.length} course${items.length > 1 ? "s" : ""} in cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Explore our catalog to find courses and start learning."
            actionLabel="Browse Courses"
            onAction={() => navigate("/course")}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <BookOpen size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {item.title}
                      </p>
                      <span className="text-xs font-semibold text-indigo-600">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.courseId)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition"
                      title="Remove from cart"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <aside>
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

                <div className="mt-4 space-y-3 border-t border-b border-slate-100 py-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Original Price</span>
                    <span>₹{(totalPrice * 1.5).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{(totalPrice * 0.5).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-base">
                    <span>Total Price</span>
                    <span className="text-indigo-600">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Secure 256-bit SSL Payment
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
