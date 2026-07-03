import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreditCard, ReceiptText } from "lucide-react";
import { auth, db } from "@/lib/auth";

function formatMoney(amount, currency) {
  const realAmount = Number(amount || 0) / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(realAmount);
}

function formatDate(date) {
  if (!date) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusStyle(status) {
  if (status === "active" || status === "paid") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "canceled" || status === "failed") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default async function SubscriptionHistoryPage() {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    session = null;
  }

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user;

  const subscriptions = await db
    .collection("Subscriptions")
    .find({
      $or: [{ userId: user.id }, { userEmail: user.email }],
    })
    .sort({ purchasedAt: -1 })
    .toArray();

  const totalPaid = subscriptions.reduce((total, subscription) => {
    return total + Number(subscription.amountTotal || 0);
  }, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">
                Subscription history
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Full history of your seller plan purchases.
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total paid
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {formatMoney(totalPaid, subscriptions[0]?.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Total subscriptions
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {subscriptions.length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Current plan</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {user.sellerPlanName || user.plan || "Free"}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Latest status</p>
          <p className="mt-3 text-3xl font-semibold capitalize text-slate-950">
            {subscriptions[0]?.status || "N/A"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {subscriptions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 font-medium text-slate-950">
              No subscription history found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your paid seller subscriptions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
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
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-950">
                        {subscription.planName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {subscription.stripePlanName || subscription.plan}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {formatMoney(
                        subscription.amountTotal,
                        subscription.currency
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(subscription.paymentStatus)}`}
                      >
                        {subscription.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(subscription.status)}`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(subscription.purchasedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-48 truncate font-mono text-xs text-slate-600">
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
    </section>
  );
}
