import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
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

function getProductFilter(productId, user) {
  if (!ObjectId.isValid(productId)) {
    return null;
  }

  return {
    _id: new ObjectId(productId),
    $or: [{ sellerId: user.id }, { sellerEmail: user.email }],
  };
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentSeller();

    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId } = await params;
    const filter = getProductFilter(productId, user);

    if (!filter) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await request.json();

    const updatedProduct = {
      name: product.name || "",
      category: product.category || "",
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      image: product.image || "",
      description: product.description || "",
      status: "pending",
      updatedAt: new Date(),
    };

    const result = await db
      .collection("products")
      .updateOne(filter, { $set: updatedProduct });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await getCurrentSeller();

    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId } = await params;
    const filter = getProductFilter(productId, user);

    if (!filter) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const result = await db.collection("products").deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
