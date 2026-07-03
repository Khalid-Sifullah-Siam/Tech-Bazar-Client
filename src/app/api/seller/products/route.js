import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, db } from "@/lib/auth";

async function getCurrentSeller() {
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
    const user = await getCurrentSeller();

    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db
      .collection("products")
      .find({
        $or: [{ sellerId: user.id }, { sellerEmail: user.email }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentSeller();

    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await request.json();
    const now = new Date();

    const newProduct = {
      name: product.name || "",
      category: product.category || "",
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      image: product.image || "",
      description: product.description || "",
      status: "pending",
      sellerId: user.id,
      sellerEmail: user.email,
      sellerName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("products").insertOne(newProduct);

    return NextResponse.json({
      message: "Product add request submitted",
      productId: result.insertedId.toString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
