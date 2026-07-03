import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth, db } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user || null;
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    }

    if (user.role !== "buyer") {
      return NextResponse.json(
        { error: "Only buyers can purchase products" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const productId = data.productId || "";
    const quantity = Number(data.quantity || 1);

    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const product = await db.collection("products").findOne({
      _id: new ObjectId(productId),
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

    const origin = new URL(request.url).origin;
    const unitAmount = Math.round(Number(product.price || 0) * 100);

    if (unitAmount < 50) {
      return NextResponse.json(
        { error: "Product price is too low for Stripe checkout" },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name || "Product",
              images: product.image ? [product.image] : [],
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      metadata: {
        type: "buyer_purchase",
        productId,
        productName: product.name || "Product",
        productImage: product.image || "",
        sellerId: product.sellerId || "",
        sellerEmail: product.sellerEmail || "",
        sellerName: product.sellerName || "",
        buyerId: user.id,
        buyerEmail: user.email,
        buyerName: user.name || "",
        quantity: String(quantity),
        unitPrice: String(Number(product.price || 0)),
      },
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${productId}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
