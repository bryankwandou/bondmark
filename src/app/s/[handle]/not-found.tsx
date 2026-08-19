import Link from "next/link";

import { SiteFooter, SiteNav } from "@/components/site-chrome";

export default function HandleNotFound() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 py-24">
          <h1 className="display text-[clamp(2rem,4.5vw,3rem)]">
            No deposit stands behind this handle.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
            Nobody has registered it. That is not an error on your side, and it is not
            nothing either: a seller can hand out any link they like, so an empty record
            is the answer. There is no money locked, and nothing here is backing the
            order you were about to place.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Ask them to register and fund a deposit before you transfer, or go ahead
            knowing the sale is unsecured.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/check"
              className="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-bond"
            >
              Try another handle
            </Link>
            <Link
              href="/limits"
              className="rounded-lg border border-rule bg-surface px-5 py-3 text-sm font-medium transition-colors hover:border-bond"
            >
              What a deposit does not cover
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
