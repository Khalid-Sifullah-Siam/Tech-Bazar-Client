import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreditCard, ReceiptText } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  formatDate,
  formatMoney,
  getBuyerTransactions,
} from "@/lib/buyer-data";

async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    return null;
  }
}

function getStatusStyle(status) {
  if (status === "paid" || status === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "failed" || status === "cancelled") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default async function BuyerTransactionsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const transactions = await getBuyerTransactions(session.user);
  const totalPaid = transactions.reduce((total, transaction) => {
    return total + Number(transaction.amount || 0);
  }, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">
                Payment history
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Full transaction history for this buyer.
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total paid
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {formatMoney(totalPaid, transactions[0]?.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-medium text-slate-950">
              No payment history found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Buyer payment records will appear here after purchase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Transaction</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Paid at</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction._id.toString()}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="max-w-56 truncate font-mono text-xs text-slate-700">
                        {transaction.transactionId || "N/A"}
                      </p>
                      <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                        Purchase: {transaction.purchaseId || "N/A"}
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
