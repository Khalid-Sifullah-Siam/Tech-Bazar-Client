import { redirect } from "next/navigation";
import { CreditCard, ReceiptText } from "lucide-react";
import { db } from "@/lib/auth";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { formatDate, formatMoney } from "@/lib/admin-data";

function getStatusStyle(status) {
  if (status === "paid" || status === "completed" || status === "active") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "failed" || status === "canceled" || status === "cancelled") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default async function AdminTransactionsPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/signin");
  }

  const [subscriptions, buyerTransactions] = await Promise.all([
    db.collection("Subscriptions").find({}).sort({ purchasedAt: -1 }).toArray(),
    db
      .collection("BuyerTransactions")
      .find({})
      .sort({ paidAt: -1, createdAt: -1 })
      .toArray(),
  ]);

  return (
    <section className="space-y-8">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Seller subscriptions first, then buyer product payment history.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Seller subscription history
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Plans purchased by sellers.
          </p>
        </div>

        {subscriptions.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No seller subscriptions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Seller</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Purchased at</th>
                  <th className="px-4 py-3 font-medium">Subscription ID</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr
                    key={subscription._id.toString()}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4 text-slate-700">
                      {subscription.userEmail || "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-950">
                        {subscription.planName || subscription.plan}
                      </p>
                      <p className="text-xs text-slate-500">
                        {subscription.stripePlanName || ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {formatMoney(
                        Number(subscription.amountTotal || 0) / 100,
                        (subscription.currency || "usd").toUpperCase()
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(subscription.paymentStatus)}`}
                      >
                        {subscription.paymentStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(subscription.status)}`}
                      >
                        {subscription.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(subscription.purchasedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-52 truncate font-mono text-xs text-slate-600">
                        {subscription.subscriptionId || "N/A"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-700" />
            <h2 className="font-semibold text-slate-950">
              Buyer product payment history
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Product purchases paid by buyers.
          </p>
        </div>

        {buyerTransactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No buyer transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Paid at</th>
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {buyerTransactions.map((transaction) => (
                  <tr
                    key={transaction._id.toString()}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="text-slate-950">
                        {transaction.buyerName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.buyerEmail || ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {transaction.productName || "N/A"}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {formatMoney(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-4 py-4 capitalize text-slate-600">
                      {transaction.paymentMethod || "online"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(transaction.paymentStatus)}`}
                      >
                        {transaction.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(transaction.paidAt)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-52 truncate font-mono text-xs text-slate-600">
                        {transaction.transactionId || "N/A"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
