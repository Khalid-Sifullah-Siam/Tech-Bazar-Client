import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth, db } from "@/lib/auth";
import { getBuyerFilter } from "@/lib/buyer-data";

async function getCurrentBuyer() {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    session = null;
  }

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function GET() {
  try {
    const user = await getCurrentBuyer();

    if (!user || user.role !== "buyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await db
      .collection("buyerPurchases")
      .find(getBuyerFilter(user))
      .sort({ purchasedAt: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      purchases: purchases.map((purchase) => ({
        ...purchase,
        _id: purchase._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentBuyer();

    if (!user || user.role !== "buyer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const quantity = Number(data.quantity || 1);
    const unitPrice = Number(data.unitPrice || data.price || 0);
    const now = new Date();
    const transactionId =
      data.transactionId || `txn_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (!data.productId || !ObjectId.isValid(data.productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await db.collection("products").findOne({
      _id: new ObjectId(data.productId),
      status: "approved",
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > Number(product.stock || 0)) {
      return NextResponse.json(
        { error: `Only ${product.stock || 0} items available` },
        { status: 400 }
      );
    }

    const stockUpdate = await db.collection("products").updateOne(
      {
        _id: new ObjectId(data.productId),
        status: "approved",
        stock: { $gte: quantity },
      },
      {
        $inc: { stock: -quantity },
        $set: { updatedAt: now },
      }
    );

    if (stockUpdate.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    const purchase = {
      buyerId: user.id,
      buyerEmail: user.email,
      buyerName: user.name,
      productId: data.productId,
      productName: product.name || data.productName || data.name || "Product",
      productImage: product.image || data.productImage || data.image || "",
      sellerId: product.sellerId || data.sellerId || "",
      sellerEmail: product.sellerEmail || data.sellerEmail || "",
      sellerName: product.sellerName || data.sellerName || "",
      quantity,
      unitPrice: Number(product.price || unitPrice),
      totalPrice: Number(product.price || unitPrice) * quantity,
      currency: data.currency || "USD",
      orderStatus: data.orderStatus || "confirmed",
      paymentStatus: data.paymentStatus || "paid",
      paymentMethod: data.paymentMethod || "online",
      transactionId,
      purchasedAt: data.purchasedAt ? new Date(data.purchasedAt) : now,
      createdAt: now,
      updatedAt: now,
    };

    purchase.productObjectId = new ObjectId(data.productId);

    const purchaseResult = await db.collection("buyerPurchases").insertOne(purchase);

    const transaction = {
      buyerId: user.id,
      buyerEmail: user.email,
      buyerName: user.name,
      purchaseId: purchaseResult.insertedId.toString(),
      productId: purchase.productId,
      productName: purchase.productName,
      sellerId: purchase.sellerId,
      sellerEmail: purchase.sellerEmail,
      sellerName: purchase.sellerName,
      amount: purchase.totalPrice,
      currency: purchase.currency,
      paymentStatus: purchase.paymentStatus,
      paymentMethod: purchase.paymentMethod,
      transactionId,
      paidAt: purchase.purchasedAt,
      createdAt: now,
    };

    await db.collection("BuyerTransactions").insertOne(transaction);

    return NextResponse.json({
      message: "Purchase saved successfully",
      purchaseId: purchaseResult.insertedId.toString(),
      transactionId,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
