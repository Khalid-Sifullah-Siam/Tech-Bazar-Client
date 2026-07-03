import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
          <Sparkles className="h-4 w-4 text-slate-900" />
          Preparing your workspace
        </div>

        <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          Loading Tech Bazaar
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 md:text-base">
          We are getting your page, data, and session ready.
        </p>

        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure session check in progress
        </div>
      </div>
    </main>
  );
}
