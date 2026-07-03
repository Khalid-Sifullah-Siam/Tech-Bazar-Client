import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Clock3,
  DollarSign,
  ShieldX,
  Users,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { formatMoney, getAdminStats } from "@/lib/admin-data";

export default async function AdminOverViewPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/signin");
  }

  const stats = await getAdminStats();
  const cards = [
    {
      title: "Total users",
      value: stats.totalUsers,
      text: "All registered accounts",
      icon: Users,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Approved products",
      value: stats.approvedProducts,
      text: "Live products approved by admin",
      icon: BadgeCheck,
      bg: "bg-emerald-50",
      color: "text-emerald-700",
    },
    {
      title: "Pending products",
      value: stats.pendingProducts,
      text: "Waiting for review",
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-amber-700",
    },
    {
      title: "Rejected products",
      value: stats.rejectedProducts,
      text: "Requests rejected by admin",
      icon: ShieldX,
      bg: "bg-rose-50",
      color: "text-rose-700",
    },
    {
      title: "Total revenue",
      value: formatMoney(stats.totalRevenue),
      text: "Seller subscriptions and buyer payments",
      icon: DollarSign,
      bg: "bg-slate-100",
      color: "text-slate-800",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm font-medium text-slate-500">Admin overview</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Welcome back, {admin.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          User, product, and revenue numbers are pulled from the database.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{card.text}</p>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
