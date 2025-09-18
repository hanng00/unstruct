"use client";

import ShaderBackground from "@/components/shader-background";
import { Button } from "@/components/ui/button";
import { REDIRECT_AFTER_SIGN_IN } from "@/lib/constants";
import {
  ArrowRight,
  CheckCircle2,
  FileDown,
  Rows3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push(REDIRECT_AFTER_SIGN_IN);
  };

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* NAVBAR */}
        <header className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-white/80 ring-1 ring-white/40 shadow-sm" />
            <span className="text-sm font-medium tracking-wide text-white/90">
              Unstruct
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/signin"
              className="text-sm text-white/80 hover:text-white transition"
            >
              Sign in
            </Link>
            <Button size="sm" className="gap-1" onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </nav>
        </header>

        {/* HERO */}
        <main className="flex-1 grid place-items-center px-6">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
              {/* Copy */}
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>From unstructured to product-ready</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-white">
                  Extract. Review. Ship.
                  <br />
                  <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                    Unstructured in, structured out.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto lg:mx-0">
                  Drop documents and get clean rows you can trust. Approve edits,
                  stream to your stack, and move faster with less glue code.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                  <Button size="lg" className="gap-2" onClick={handleGetStarted}>
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link
                    href="/workspaces"
                    className="text-sm text-white/80 hover:text-white transition"
                  >
                    Explore the demo →
                  </Link>
                </div>

                {/* Logo cloud */}
                <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 opacity-80">
                  <div className="h-6 w-16 rounded bg-white/20" />
                  <div className="h-6 w-20 rounded bg-white/20" />
                  <div className="h-6 w-12 rounded bg-white/20" />
                  <div className="h-6 w-20 rounded bg-white/20" />
                </div>
              </div>

              {/* Glass teaser */}
              <div className="relative">
                <div className="absolute -inset-6 rounded-2xl bg-white/10 blur-3xl opacity-40" />
                <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <Rows3 className="h-4 w-4" />
                      Workspace Review
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-3 text-white/70">Field</div>
                    <div className="col-span-7 text-white/70">Value</div>
                    <div className="col-span-2 text-white/70 text-right">Status</div>

                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="col-span-12 grid grid-cols-12 items-center rounded-md border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <div className="col-span-3 truncate text-white/90">Invoice {i}</div>
                        <div className="col-span-7 truncate text-white/80">
                          ACME Corporation — $12,3{i} USD — 2025-09-0{i}
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1 text-emerald-200/90">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approved
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <FileDown className="h-4 w-4" /> Export as CSV
                    </div>
                    <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Drop any file",
                  desc: "PDF, email, spreadsheets, docs — it just works.",
                },
                {
                  title: "Review with confidence",
                  desc: "Editable rows, instant approvals, perfect audit trail.",
                },
                {
                  title: "Blend into products",
                  desc: "Stream data to your stack with zero glue code.",
                },
              ].map((f, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-md text-white/90"
                >
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="mt-1 text-xs text-white/75">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="px-6 py-6 text-center text-xs text-white/70">
          <span>© {new Date().getFullYear()} Unstruct. All rights reserved.</span>
        </footer>
      </div>
    </ShaderBackground>
  );
};

export default LandingPage;
