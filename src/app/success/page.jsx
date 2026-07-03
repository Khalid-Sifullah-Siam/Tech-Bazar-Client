import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Mail,
  LayoutDashboard,
  BadgeCheck,
} from "lucide-react";
import { ObjectId } from "mongodb";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/auth";
import SuccessToast from "@/components/SuccessToast";

function getSellerPlanDetails(planName) {
  if (planName === "Starter Seller") {
    return {
      savedPlan: "pro",
      displayPlanName: "Pro",
    };
  }

  if (planName === "Professional Seller") {
    return {
      savedPlan: "pro plus",
      displayPlanName: "Pro Plus",
    };
  }

  return {
    savedPlan: "free",
    displayPlanName: planName,
  };
}

async function savePurchasedPlan(sessionId) {
  if (!sessionId) {
    return;
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (checkoutSession.payment_status !== "paid") {
    return;
  }

  const userId = checkoutSession.metadata?.userId;
  const userEmail = checkoutSession.metadata?.userEmail;
  const planName = checkoutSession.metadata?.planName;
  const priceId = checkoutSession.metadata?.priceId;

  if (checkoutSession.metadata?.type === "buyer_purchase") {
    return;
  }

  if (!userId || !planName) {
    return;
  }

  const { savedPlan, displayPlanName } = getSellerPlanDetails(planName);
  const userFilter = ObjectId.isValid(userId)
    ? { _id: new ObjectId(userId) }
    : { id: userId };

  await db.collection("user").updateOne(
    userFilter,
    {
      $set: {
        role: "seller",
        plan: savedPlan,
        sellerPlanName: displayPlanName,
      },
    }
  );

  await db.collection("Subscriptions").updateOne(
    { checkoutSessionId: checkoutSession.id },
    {
      $set: {
        userId,
        userEmail: userEmail || "",
        role: "seller",
        plan: savedPlan,
        planName: displayPlanName,
        stripePlanName: planName,
        priceId: priceId || "",
        checkoutSessionId: checkoutSession.id,
        subscriptionId:
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription?.id || "",
        paymentStatus: checkoutSession.payment_status,
        status:
          typeof checkoutSession.subscription === "string"
            ? "active"
            : checkoutSession.subscription?.status || "active",
        amountTotal: checkoutSession.amount_total || 0,
        currency: checkoutSession.currency || "",
        purchasedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

async function saveBuyerPurchase(sessionId) {
  if (!sessionId) {
    return null;
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    checkoutSession.payment_status !== "paid" ||
    checkoutSession.metadata?.type !== "buyer_purchase"
  ) {
    return null;
  }

  const existingPurchase = await db.collection("buyerPurchases").findOne({
    checkoutSessionId: checkoutSession.id,
  });

  if (existingPurchase) {
    return {
      isBuyerPurchase: true,
      purchase: existingPurchase,
      stockUpdated: true,
    };
  }

  const metadata = checkoutSession.metadata || {};
  const productId = metadata.productId || "";
  const quantity = Number(metadata.quantity || 1);
  const unitPrice = Number(metadata.unitPrice || 0);
  const totalPrice = Number(checkoutSession.amount_total || unitPrice * quantity * 100) / 100;
  const now = new Date();

  if (!ObjectId.isValid(productId) || quantity < 1) {
    return {
      isBuyerPurchase: true,
      purchase: null,
      stockUpdated: false,
    };
  }

  const stockUpdate = await db.collection("products").updateOne(
    {
      _id: new ObjectId(productId),
      status: "approved",
      stock: { $gte: quantity },
    },
    {
      $inc: { stock: -quantity },
      $set: { updatedAt: now },
    }
  );

  if (stockUpdate.modifiedCount === 0) {
    await db.collection("BuyerTransactions").updateOne(
      { checkoutSessionId: checkoutSession.id },
      {
        $set: {
          buyerId: metadata.buyerId || "",
          buyerEmail: metadata.buyerEmail || "",
          buyerName: metadata.buyerName || "",
          productId,
          productName: metadata.productName || "Product",
          amount: totalPrice,
          currency: checkoutSession.currency || "usd",
          paymentStatus: "paid",
          paymentMethod: "stripe",
          orderStatus: "stock_failed",
          checkoutSessionId: checkoutSession.id,
          transactionId: checkoutSession.payment_intent || checkoutSession.id,
          paidAt: now,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return {
      isBuyerPurchase: true,
      purchase: null,
      stockUpdated: false,
    };
  }

  const purchase = {
    buyerId: metadata.buyerId || "",
    buyerEmail: metadata.buyerEmail || "",
    buyerName: metadata.buyerName || "",
    productId,
    productObjectId: new ObjectId(productId),
    productName: metadata.productName || "Product",
    productImage: metadata.productImage || "",
    sellerId: metadata.sellerId || "",
    sellerEmail: metadata.sellerEmail || "",
    sellerName: metadata.sellerName || "",
    quantity,
    unitPrice,
    totalPrice,
    currency: (checkoutSession.currency || "usd").toUpperCase(),
    orderStatus: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "stripe",
    checkoutSessionId: checkoutSession.id,
    transactionId: checkoutSession.payment_intent || checkoutSession.id,
    purchasedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const purchaseResult = await db.collection("buyerPurchases").insertOne(purchase);

  await db.collection("BuyerTransactions").insertOne({
    buyerId: purchase.buyerId,
    buyerEmail: purchase.buyerEmail,
    buyerName: purchase.buyerName,
    purchaseId: purchaseResult.insertedId.toString(),
    productId: purchase.productId,
    productName: purchase.productName,
    sellerId: purchase.sellerId,
    sellerEmail: purchase.sellerEmail,
    sellerName: purchase.sellerName,
    amount: totalPrice,
    currency: purchase.currency,
    paymentStatus: "paid",
    paymentMethod: "stripe",
    checkoutSessionId: checkoutSession.id,
    transactionId: purchase.transactionId,
    paidAt: now,
    createdAt: now,
  });

  return {
    isBuyerPurchase: true,
    purchase,
    stockUpdated: true,
  };
}

export default async function SuccessPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  await savePurchasedPlan(sessionId);
  const buyerPurchaseResult = await saveBuyerPurchase(sessionId);
  const isBuyerPurchase = Boolean(buyerPurchaseResult?.isBuyerPurchase);
  const isBuyerStockUpdated = Boolean(buyerPurchaseResult?.stockUpdated);

  const nextSteps = [
    {
      icon: LayoutDashboard,
      title: isBuyerPurchase ? "View your products" : "Go to dashboard",
      text: isBuyerPurchase
        ? "Open your buyer dashboard to see this purchase."
        : "Open your seller dashboard and start setting up your store.",
      href: isBuyerPurchase ? "/dashboard/buyer/products" : "/dashboard/seller",
      label: "Dashboard",
    },
    {
      icon: Mail,
      title: "Check your email",
      text: "We sent a payment confirmation and plan details to your inbox.",
      href: "mailto:sales@techbazaar.com",
      label: "Email support",
    },
    {
      icon: BadgeCheck,
      title: "Review your plan",
      text: "Confirm the selected plan and prepare your profile details.",
      href: "/pricing",
      label: "View pricing",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-16">
      <SuccessToast />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-lg">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Payment successful
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                {isBuyerPurchase
                  ? "Order confirmed."
                  : "Your seller plan is now active."}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {isBuyerPurchase
                  ? isBuyerStockUpdated
                    ? "Your Stripe payment went through, your order was saved, and the product stock has been updated."
                    : "Your Stripe payment went through and your order is confirmed. Our team will review stock status for this order."
                  : "Thanks for joining Tech Bazaar. Your payment went through, and your account is ready for the next setup steps. You can now continue to your dashboard and complete your seller profile."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={isBuyerPurchase ? "/dashboard/buyer/products" : "/dashboard/seller"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  {isBuyerPurchase ? "View order" : "Go to dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={isBuyerPurchase ? "/products" : "/pricing"}
                  className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {isBuyerPurchase ? "Browse more products" : "Back to pricing"}
                </Link>
              </div>
            </div>

            <div className="border-t bg-slate-50 p-8 md:p-12 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  What happens next
                </p>

                <div className="mt-6 space-y-5">
                  {nextSteps.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <step.icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-sm font-semibold text-slate-900">
                            {step.title}
                          </h2>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {step.text}
                          </p>
                          <Link
                            href={step.href}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {step.label}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Need help?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reply to the confirmation email if anything looks wrong.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Seller setup</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isBuyerPurchase
                ? "Your product quantity has been saved in buyer history."
                : "Add your store details, logo, and product information next."}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Ready to grow</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your subscription is confirmed, so you can start working right
              away.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
