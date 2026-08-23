import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { paymentService, type PaymentTransactionRecord } from "../../../services/paymentService";

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
      .getHistory()
      .then((data) => setPayments(data || []))
      .catch((err) => console.error("Failed to fetch payment transactions", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#252a43]">Payment Transactions & Receipts</h2>
          <p className="text-[11px] text-gray-400">Verified Razorpay purchase records</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
          {payments.length} Transactions
        </span>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading payment history...</div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
          No payment transactions found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((tx) => {
                const isSuccess = tx.status === "paid" || (tx.status as string) === "completed";
                return (
                  <tr key={tx.id || tx.orderId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-semibold text-slate-900">{tx.courseTitle}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">₹{tx.amount}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500">{tx.orderId}</td>
                    <td className="py-3 px-3 text-slate-500">{tx.paymentMethod}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isSuccess
                            ? "bg-emerald-50 text-emerald-700"
                            : tx.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
