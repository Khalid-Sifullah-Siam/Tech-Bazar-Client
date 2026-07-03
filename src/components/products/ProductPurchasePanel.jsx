"use client";

import { useState } from "react";
import { Button, Input, Label } from "@heroui/react";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

export default function ProductPurchasePanel({ product }) {
  const { data: session } = authClient.useSession();
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const user = session?.user;
  const isBuyer = user?.role === "buyer";
  const availableStock = Number(product.stock || 0);
  const totalPrice = Number(product.price || 0) * Number(quantity || 1);
  const canPurchase = isBuyer && availableStock > 0 && quantity <= availableStock;

  async function handlePurchase() {
    if (!isBuyer) {
      toast.error("Only buyers can purchase products.");
      return;
    }

    setIsPurchasing(true);

    try {
      if (quantity > availableStock) {
        toast.error(`Only ${availableStock} items available.`);
        return;
      }

      const response = await fetch("/api/buyer/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Purchase failed.");
        return;
      }

      if (!data.url) {
        toast.error("Stripe checkout could not be started.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <section className="rounded-lg border bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Purchase</h2>
          <p className="mt-1 text-sm text-slate-500">
            Only buyer accounts can place an order for this product.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            min="1"
            max={availableStock}
            type="number"
            value={String(quantity)}
            onChange={(event) => {
              const nextValue = Number(event.target.value || 1);
              if (nextValue < 1) {
                setQuantity(1);
                return;
              }

              if (nextValue > availableStock) {
                setQuantity(availableStock);
                return;
              }

              setQuantity(nextValue);
            }}
            variant="secondary"
          />
          <p className="text-xs text-slate-500">
            Available stock: {availableStock}
          </p>
        </div>

        <div className="rounded-lg border bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">Unit price</span>
            <span className="font-medium text-slate-950">
              {formatMoney(product.price)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">Total price</span>
            <span className="text-lg font-semibold text-slate-950">
              {formatMoney(totalPrice)}
            </span>
          </div>
        </div>

        {isBuyer ? (
          <Button
            type="button"
            disabled={!canPurchase || isPurchasing}
            onClick={handlePurchase}
            className="h-11 w-full rounded-lg bg-slate-950 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isPurchasing ? "Opening Stripe..." : "Purchase now"}
          </Button>
        ) : null}

        {!user ? (
          <p className="text-sm text-slate-500">
            Sign in as a buyer to purchase this product.
          </p>
        ) : null}

        {user && !isBuyer ? (
          <p className="text-sm text-slate-500">
            Your current role is {user.role}. Only buyer accounts can purchase.
          </p>
        ) : null}

        {isBuyer && availableStock === 0 ? (
          <p className="text-sm text-rose-600">
            This product is currently out of stock.
          </p>
        ) : null}
      </div>
    </section>
  );
}
