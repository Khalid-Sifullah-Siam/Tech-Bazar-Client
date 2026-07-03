import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import {
  BadgeCheck,
  ChevronLeft,
  Hash,
  PackageSearch,
  Store,
  Tag,
  Boxes,
} from "lucide-react";
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel";
import { auth, db } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    return null;
  }
}

async function getProduct(productId) {
  if (!ObjectId.isValid(productId)) {
    return null;
  }

  return db.collection("products").findOne({
    _id: new ObjectId(productId),
    status: "approved",
  });
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const [product, session] = await Promise.all([getProduct(id), getSession()]);

  if (!product) {
    notFound();
  }

  const user = session?.user || null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-7xl space-y-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to products
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-lg border bg-white">
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <PackageSearch className="h-14 w-14" />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Full details
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                    {product.name}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    {product.category || "General"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">
                    {formatMoney(product.price)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
                    <Hash className="h-4 w-4" />
                    Product ID
                  </div>
                  <p className="mt-2 break-all font-mono text-sm font-medium text-slate-950">
                    {product._id.toString()}
                  </p>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
                    <Tag className="h-4 w-4" />
                    Category
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {product.category || "General"}
                  </p>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
                    <Boxes className="h-4 w-4" />
                    Stock
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {product.stock || 0}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    units available
                  </p>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Seller
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {product.sellerName || "Seller"}
                  </p>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Status
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                    Approved
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Description
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {product.description ||
                    "No description added for this product."}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Seller information
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Public details for this approved product.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Seller name</p>
                  <p className="mt-1 font-medium text-slate-950">
                    {product.sellerName || "Seller"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Seller email</p>
                  <p className="mt-1 break-all font-medium text-slate-950">
                    {product.sellerEmail || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Your role</p>
                  <p className="mt-1 font-medium capitalize text-slate-950">
                    {user?.role || "Guest"}
                  </p>
                </div>
              </div>
            </div>

            <ProductPurchasePanel
              product={{
                _id: product._id.toString(),
                name: product.name,
                image: product.image || "",
                price: product.price || 0,
                stock: product.stock || 0,
                sellerId: product.sellerId || "",
                sellerName: product.sellerName || "",
                sellerEmail: product.sellerEmail || "",
              }}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
