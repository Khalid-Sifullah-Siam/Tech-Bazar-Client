import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/auth";
import { getCurrentAdmin } from "@/lib/admin-auth";

function getProductFilter(productId) {
  if (!ObjectId.isValid(productId)) {
    return null;
  }

  return { _id: new ObjectId(productId) };
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db
      .collection("products")
      .find({})
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

export async function PATCH(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const filter = getProductFilter(data.productId);

    if (!filter) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    if (data.status !== "approved" && data.status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await db.collection("products").updateOne(filter, {
      $set: {
        status: data.status,
        reviewedBy: admin.id,
        reviewedByEmail: admin.email,
        reviewedAt: new Date(),
        rejectReason: data.rejectReason || "",
      },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidatePath("/products");
    revalidatePath("/dashboard/admin/maintain-products");

    return NextResponse.json({ message: `Product ${data.status}` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
