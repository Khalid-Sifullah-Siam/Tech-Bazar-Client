import Link from "next/link";

export default function ContactSalesPage() {
  const steps = [
    "Share your business name and what you sell.",
    "Tell us how many products you want to manage.",
    "Mention if you need custom API or system integration.",
    "Explain if you want homepage promotion or featured placement.",
    "Add your phone number and business email for a quick reply.",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-orange-50 px-4 py-16">
      <section className="mx-auto max-w-4xl rounded-3xl border bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Custom Seller Plan
        </p>

        <h1 className="mt-4 text-3xl font-bold md:text-5xl">
          Contact our sales team
        </h1>

        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          The custom plan is for large businesses that need extra support,
          custom tools, and a special pricing setup. Before we activate the
          plan, please prepare the details below.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-orange-50 p-6">
            <h2 className="text-xl font-semibold">What you should prepare</h2>

            <ul className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">How to contact us</h2>

            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <p>
                Email: <span className="font-medium text-foreground">sales@techbazaar.com</span>
              </p>
              <p>
                Phone: <span className="font-medium text-foreground">+880 1234-567890</span>
              </p>
              <p>
                Support time: <span className="font-medium text-foreground">Sunday to Thursday, 10 AM to 6 PM</span>
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold">What happens next?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                After you contact us, our team will review your needs, discuss
                pricing, and guide you through the final setup.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-xl border px-5 py-3 text-center text-sm font-medium"
              >
                Back to Pricing
              </Link>

              <a
                href="mailto:sales@techbazaar.com"
                className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-medium text-white"
              >
                Email Sales Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
