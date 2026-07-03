import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  CreditCard,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { auth } from "@/lib/auth";
import {
  formatDate,
  formatMoney,
  getBuyerPurchases,
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

export default async function BuyerOverviewPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user;
  const purchases = await getBuyerPurchases(user);
  const transactions = await getBuyerTransactions(user);

  const totalQuantity = purchases.reduce((total, purchase) => {
    return total + Number(purchase.quantity || 0);
  }, 0);
  const totalCost = purchases.reduce((total, purchase) => {
    return total + Number(purchase.totalPrice || 0);
  }, 0);
  const paidTransactions = transactions.filter((transaction) => {
    return transaction.paymentStatus === "paid" || transaction.paymentStatus === "completed";
  });
  const latestPurchases = purchases.slice(0, 5);

  const stats = [
    {
      title: "Purchased products",
      value: totalQuantity,
      text: "Total quantity bought",
      icon: ShoppingBag,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Total cost",
      value: formatMoney(totalCost, purchases[0]?.currency),
      text: "All purchases combined",
      icon: CreditCard,
      bg: "bg-emerald-50",
      color: "text-emerald-700",
    },
    {
      title: "Payments",
      value: paidTransactions.length,
      text: "Successful payment records",
      icon: ReceiptText,
      bg: "bg-amber-50",
      color: "text-amber-700",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm font-medium text-slate-500">Buyer overview</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Welcome back, {user.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Your purchases, spending, and payment activity are shown from the
          database.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{stat.text}</p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">Recent purchases</h2>
              <p className="text-sm text-slate-500">
                Latest products bought by this buyer.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {latestPurchases.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                No purchases found yet.
              </p>
            ) : (
              latestPurchases.map((purchase) => (
                <div
                  key={purchase._id.toString()}
                  className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {purchase.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty {purchase.quantity} • {formatDate(purchase.purchasedAt)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-950">
                    {formatMoney(purchase.totalPrice, purchase.currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Buyer account</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            {user.email}
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Role</span>
              <span className="font-medium capitalize text-slate-950">
                {user.role}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Orders</span>
              <span className="font-medium text-slate-950">
                {purchases.length}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Total cost</span>
              <span className="font-medium text-slate-950">
                {formatMoney(totalCost, purchases[0]?.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
