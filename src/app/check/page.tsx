import { HandleLookup } from "@/components/handle-lookup";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

export const metadata = {
  title: "Check a seller",
  description:
    "Type the handle a seller gave you and see what they have locked as a refund guarantee.",
};

export default function CheckPage() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="ledger-ground pointer-events-none absolute inset-0" aria-hidden />

          <div className="relative mx-auto max-w-3xl px-5 py-24">
            <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">
              Who are you about to pay?
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
              Sellers on Bondmark have a handle. Type theirs and you get the deposit
              amount, how long it has sat there, and every claim anyone has filed —
              read live from the chain, not from anything they wrote about themselves.
            </p>

            <div className="mt-10">
              <HandleLookup autoFocus />
            </div>

            <div className="mt-16 border-t border-rule pt-8">
              <h2 className="text-lg font-medium">If the handle comes back empty</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                It means nobody has registered it. A seller can hand out any link they
                like, so the absence of a record is itself the answer: there is no
                deposit, and nothing here is standing behind the order. Ask them to
                register before you transfer, or treat the sale as unsecured.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
