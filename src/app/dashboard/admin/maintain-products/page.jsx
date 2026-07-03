"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { toast } from "react-toastify";

function getStatusStyle(status) {
  if (status === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function MaintainProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/products");
    const data = await response.json();

    if (response.ok) {
      setProducts(data.products || []);
    } else {
      setMessage(data.error || "Products could not be loaded");
      toast.error(data.error || "Products could not be loaded.");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let shouldUpdate = true;

    async function fetchProducts() {
      const response = await fetch("/api/admin/products");
      const data = await response.json();

      if (!shouldUpdate) {
        return;
      }

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setMessage(data.error || "Products could not be loaded");
        toast.error(data.error || "Products could not be loaded.");
      }

      setIsLoading(false);
    }

    fetchProducts();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const updateProductStatus = async (productId, status) => {
    setMessage("");

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, status }),
    });
    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      toast.success(
        status === "approved"
          ? "Product approved successfully."
          : "Product rejected successfully."
      );
      await loadProducts();
    } else {
      setMessage(data.error || "Product update failed");
      toast.error(data.error || "Product update failed.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Maintain products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review seller product requests and approve or reject them.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      )}

      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-950">No product requests</p>
            <p className="mt-1 text-sm text-slate-500">
              Seller product requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Seller</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-1">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="h-full w-full object-contain object-center"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">
                            {product.name}
                          </p>
                          <p className="line-clamp-1 max-w-xs text-xs text-slate-500">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-950">
                        {product.sellerName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.sellerEmail || ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      ${product.price}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {product.stock}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(product.status)}`}
                      >
                        {product.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {product.status === "approved" ? (
                          <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Approved
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              updateProductStatus(product._id, "approved")
                            }
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            updateProductStatus(product._id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </div>
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
