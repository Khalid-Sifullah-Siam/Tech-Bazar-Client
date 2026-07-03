import { Button } from "@heroui/react";
import Link from "next/link";

export default function SellerPricingPage() {
  const plans = [
    {
      name: "Starter Seller",
      price: "$4",
      productId: "prod_UoRz8cmwbdVkjk",
      period: "/month",
      description: "Perfect for new sellers starting their journey.",
      features: [
        "Up to 50 products",
        "Basic analytics",
        "Order management",
        "Seller profile",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional Seller",
      price: "$14",
      productId: "prod_UoSNyHAAgCzf3T",
      period: "/month",
      description: "For growing businesses that need more visibility.",
      features: [
        "Unlimited products",
        "Advanced analytics",
        "Priority product listing",
        "Promotional campaigns",
        "Inventory management",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Enterprise Seller",
      price: "Custom",
      period: "",
      description: "For brands and large-scale businesses.",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "Featured homepage placement",
        "API access",
        "24/7 support",
      ],
      popular: false,
    },
  ];

  return (
    <main className="bg-linear-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <span className="inline-flex rounded-full border px-4 py-1 text-sm font-medium">
          Become a Seller
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
          Grow Your Business
          <span className="block text-primary">
            Sell to Thousands of Customers
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Start selling on our marketplace and reach more customers with
          powerful tools, secure payments, and dedicated seller support.
        </p>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border bg-white p-8 shadow-sm transition-all hover:shadow-xl ${
                plan.popular ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-1 text-sm font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <p className="mt-3 text-muted-foreground">{plan.description}</p>

              <div className="mt-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <svg
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.name === "Enterprise Seller" ? (
                <Link
                  href="/contact-sales"
                  className="mt-8 inline-flex w-full items-center justify-center bg-blue-500 text-white rounded-4xl px-4 py-3 font-medium text-primary-foreground"
                >
                  Contact Sales
                </Link>
              ) : (
                <form action="/api/checkout_sessions" method="POST">
                  <input type="hidden" name="planName" value={plan.name} />
                  <input type="hidden" name="productId" value={plan.productId} />

                  <Button
                    type="submit"
                    className={`mt-8 w-full  font-medium`}
                  >
                    Become Seller
                  </Button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold">Why Sell With Us?</h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Large Customer Base</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Reach thousands of active buyers every day.
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fast and secure payment settlements.
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Seller Dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track sales, inventory, and performance.
              </p>
            </div>

            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Marketing Tools</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Promote products and boost visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="rounded-3xl border bg-linear-to-r from-primary/10 to-primary/5 p-10 text-center">
          <h2 className="text-3xl font-bold">Ready to Start Selling?</h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join our marketplace today and start growing your online business.
          </p>

          <button className="mt-8 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground">
            Apply as Seller
          </button>
        </div>
      </section>
    </main>
  );
}
