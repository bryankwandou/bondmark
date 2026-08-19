import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { BOND_CEILING_SOL, MIN_BOND_SOL } from "@/lib/score";

export const metadata = {
  title: "How the score works",
  description:
    "The full arithmetic behind a Bondmark score, with every weight and every input named.",
};

const CREDITS = [
  {
    label: "Collateral depth",
    max: 40,
    formula: `40 × log₁₀(1 + bond / ${MIN_BOND_SOL}) ÷ log₁₀(1 + ${BOND_CEILING_SOL} / ${MIN_BOND_SOL})`,
    why: "Going from nothing to half a SOL changes a buyer's exposure far more than going from 50 to 50.5, so the curve is logarithmic. It saturates at 100 SOL, which stops a large wallet from simply buying a perfect score.",
  },
  {
    label: "Time bonded",
    max: 25,
    formula: "25 × √(days bonded ÷ 365), capped at 1",
    why: "The first weeks separate a seller from someone who registered this morning; past a year, more time adds little. A full withdrawal resets the clock on chain, so tenure cannot be built, cashed out, and claimed again.",
  },
  {
    label: "Claim outcomes",
    max: 25,
    formula: "25 × (dismissed + 1) ÷ (dismissed + slashed + 2)",
    why: "One imaginary win and one imaginary loss are added before dividing. Without that, a seller with a single dismissed claim would look flawless and a seller with none would look identical to a seller with a hundred clean ones.",
  },
  {
    label: "Deposit kept in place",
    max: 10,
    formula: "10 × (current bond ÷ everything ever deposited)",
    why: "Catches the pattern where a seller funds a large deposit, collects the badge and the orders, then walks most of it back out while the profile still looks funded.",
  },
];

const PENALTIES = [
  {
    label: "Unresolved claims",
    amount: "−8 each, floor of −30",
    why: "A claim nobody has ruled on yet is the loudest live signal available. It is capped so a coordinated flood of filings cannot be used to destroy a competitor.",
  },
  {
    label: "Withdrawal announced",
    amount: "−20",
    why: "Applied the moment the seven day notice starts, not when it finishes. The whole purpose of the notice is that buyers can see it while it runs.",
  },
  {
    label: "Paid out to buyers",
    amount: "up to −20",
    why: "Scaled by how much of the seller's lifetime deposits ended up going to claimants. Money that actually left the deposit is the strongest evidence there is.",
  },
];

export default function FormulaPage() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <section className="border-b border-rule">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">
              Nothing here is a judgement call.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
              A score is worth something only if the person relying on it can check it.
              So the whole calculation is below, the inputs all come from accounts you
              can fetch yourself, and no part of it is adjusted per seller, per region,
              or by anyone at Bondmark.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              There is no model in this loop. A language model asked the same question
              twice can answer differently, which would make the number unusable for
              the one job it has.
            </p>
          </div>
        </section>

        <section className="border-b border-rule bg-paper-deep">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="display text-2xl">What earns points</h2>
            <div className="mt-8 space-y-8">
              {CREDITS.map((c) => (
                <div key={c.label} className="rounded-xl border border-rule bg-surface p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium">{c.label}</h3>
                    <span className="figure text-sm text-bond">up to {c.max}</span>
                  </div>
                  <code className="figure mt-3 block overflow-x-auto rounded-lg bg-paper-deep px-3 py-2.5 text-xs text-ink-soft">
                    {c.formula}
                  </code>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{c.why}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-rule">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="display text-2xl">What takes them away</h2>
            <div className="mt-8 space-y-8">
              {PENALTIES.map((p) => (
                <div key={p.label} className="rounded-xl border border-rule bg-surface p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium">{p.label}</h3>
                    <span className="figure text-sm text-claim">{p.amount}</span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p.why}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-rule bg-paper-deep p-6">
              <h3 className="font-medium">One rule that overrides the rest</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                An empty deposit scores zero, whatever the history says. Years of clean
                trading are worth nothing to a buyer who cannot be paid out today.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="display text-2xl">Check our arithmetic</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              The implementation is a single file with no dependencies beyond the
              account data it is handed. Read it, or fetch a seller account and run the
              numbers yourself.
            </p>
            <a
              href="https://github.com/bryankwandou/bondmark/blob/main/src/lib/score.ts"
              target="_blank"
              rel="noreferrer"
              className="figure mt-5 inline-block rounded-lg border border-rule bg-surface px-4 py-3 text-sm transition-colors hover:border-bond"
            >
              src/lib/score.ts
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
