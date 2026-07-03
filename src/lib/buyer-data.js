import { ObjectId } from "mongodb";
import { db } from "@/lib/auth";

export function getBuyerFilter(user) {
  const buyerOptions = [
    { buyerId: user.id },
    { buyerId: String(user.id) },
    { buyerEmail: user.email },
    { userId: user.id },
    { userId: String(user.id) },
    { email: user.email },
  ];

  if (ObjectId.isValid(user.id)) {
    const userObjectId = new ObjectId(user.id);

    buyerOptions.push(
      { buyerId: userObjectId },
      { userId: userObjectId },
      { customerId: userObjectId }
    );
  }

  return { $or: buyerOptions };
}

export async function getBuyerPurchases(user) {
  return db
    .collection("buyerPurchases")
    .find(getBuyerFilter(user))
    .sort({ purchasedAt: -1, createdAt: -1 })
    .toArray();
}

export async function getBuyerTransactions(user) {
  return db
    .collection("BuyerTransactions")
    .find(getBuyerFilter(user))
    .sort({ paidAt: -1, createdAt: -1 })
    .toArray();
}

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
