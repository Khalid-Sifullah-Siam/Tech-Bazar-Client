import { db } from "@/lib/auth";

export function formatMoney(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount || 0));
}

export function formatDate(date) {
  if (!date) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export async function getAdminStats() {
  const [
    totalUsers,
    approvedProducts,
    rejectedProducts,
    pendingProducts,
    sellerSubscriptions,
    buyerTransactions,
  ] = await Promise.all([
    db.collection("user").countDocuments(),
    db.collection("products").countDocuments({ status: "approved" }),
    db.collection("products").countDocuments({ status: "rejected" }),
    db.collection("products").countDocuments({ status: "pending" }),
    db.collection("Subscriptions").find({ paymentStatus: "paid" }).toArray(),
    db
      .collection("BuyerTransactions")
      .find({ paymentStatus: { $in: ["paid", "completed"] } })
      .toArray(),
  ]);

  const subscriptionRevenue = sellerSubscriptions.reduce((total, item) => {
    return total + Number(item.amountTotal || 0) / 100;
  }, 0);

  const buyerRevenue = buyerTransactions.reduce((total, item) => {
    return total + Number(item.amount || 0);
  }, 0);

  return {
    totalUsers,
    approvedProducts,
    rejectedProducts,
    pendingProducts,
    totalRevenue: subscriptionRevenue + buyerRevenue,
  };
}
