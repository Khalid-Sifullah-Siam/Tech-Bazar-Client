import Link from "next/link";
import { ArrowLeft, SearchX, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <SearchX className="h-8 w-8" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
          <Sparkles className="h-4 w-4 text-slate-900" />
          Page not found
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          We could not find that page.
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          The link may be broken, or the page may have moved. Let&apos;s take
          you back to a place that works.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go home
          </Link>

          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
