import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  formatDate,
  formatMoney,
  getBuyerPurchases,
} from "@/lib/buyer-data";

async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    return null;
  }
}

function getStatusStyle(status) {
  if (
    status === "confirmed" ||
    status === "delivered" ||
    status === "completed" ||
    status === "paid"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "cancelled" || status === "failed") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getOrderStatusLabel(status) {
  if (!status || status === "processing") {
    return "confirmed";
  }

  return status;
}

export default async function BuyerProductsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const purchases = await getBuyerPurchases(session.user);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Purchased products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Full product purchase information for this buyer.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {purchases.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-950">No purchased products</p>
            <p className="mt-1 text-sm text-slate-500">
              Buyer product history will appear here after purchase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Seller</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Unit price</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Buying date</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase._id.toString()}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-1">
                          {purchase.productImage ? (
                            <Image
                              src={purchase.productImage}
                              alt={purchase.productName}
                              width={48}
                              height={48}
                              unoptimized
                              className="h-full w-full object-contain object-center"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">
                            {purchase.productName}
                          </p>
                          <p className="max-w-44 truncate font-mono text-xs text-slate-500">
                            {purchase.productId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-950">
                        {purchase.sellerName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {purchase.sellerEmail || ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {purchase.quantity}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatMoney(purchase.unitPrice, purchase.currency)}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {formatMoney(purchase.totalPrice, purchase.currency)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(purchase.purchasedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(getOrderStatusLabel(purchase.orderStatus))}`}
                      >
                        {getOrderStatusLabel(purchase.orderStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(purchase.paymentStatus)}`}
                      >
                        {purchase.paymentStatus || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
