import Link from "next/link";

import { LogoMark } from "./logo";
import { PROGRAM_ID, explorerAccount } from "@/lib/solana/bondmark";

const NAV = [
  { href: "/check", label: "Check a seller" },
  { href: "/formula", label: "How the score works" },
  { href: "/dashboard", label: "For sellers" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-md"
          aria-label="Bondmark home"
        >
          <LogoMark size={28} />
          <span className="display text-[22px] leading-none">Bondmark</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="rounded-lg bg-bond px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-px active:translate-y-0"
        >
          Lock a deposit
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-paper-deep">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <LogoMark size={32} />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              A deposit is a cap on what you can lose, not insurance. Bondmark shows
              you the size of that cap and how hard it would be for a seller to move
              it. What you do with that is your call.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/limits" className="text-ink-soft transition-colors hover:text-ink">
              What this does not cover
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-rule pt-6 text-xs text-ink-faint md:flex-row md:items-center md:justify-between">
          <span>Running on Solana devnet. Deposits are test funds.</span>
          <a
            href={explorerAccount(PROGRAM_ID.toBase58())}
            target="_blank"
            rel="noreferrer"
            className="figure transition-colors hover:text-ink"
          >
            Program {PROGRAM_ID.toBase58()}
          </a>
        </div>
      </div>
    </footer>
  );
}
