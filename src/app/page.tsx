import Link from "next/link";

import { HandleLookup } from "@/components/handle-lookup";
import { ScoreDial } from "@/components/score-dial";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { LogoMark } from "@/components/logo";
import { PROGRAM_ID, explorerAccount } from "@/lib/solana/bondmark";
import { scoreSeller } from "@/lib/score";

/**
 * The sample used across the marketing surface. It runs through the same scoring
 * function the live profiles use, so the landing page can never advertise a
 * breakdown the product would not actually produce.
 */
const SAMPLE = scoreSeller(
  {
    bond: 250_000_000n,
    lifetimeDeposited: 250_000_000n,
    slashedTotal: 0n,
    registeredAt: 0,
    bondedSince: Math.floor(Date.now() / 1000) - 74 * 86_400,
    disputesOpened: 3,
    disputesSlashed: 0,
    disputesDismissed: 3,
    openDisputes: 0,
    withdrawUnlockAt: 0,
  },
  Math.floor(Date.now() / 1000),
);

export default function Home() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <Hero />
        <Situation />
        <Mechanism />
        <Scoring />
        <BadgeSection />
        <Limits />
        <Proof />
      </main>

      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-rule">
      <div className="ledger-ground pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-5 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-bond" />
            Live on Solana devnet
          </span>

          <h1 className="display mt-6 text-[clamp(2.6rem,6.2vw,4.6rem)] text-ink">
            Before you transfer,
            <br />
            check what they
            <br />
            stand to lose.
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            A seller puts a refund deposit into a Solana program. It sits there in
            the open, and anyone can read the amount, how long it has been held, and
            every claim ever filed against it. If they take your money and go quiet,
            that deposit is what pays you back.
          </p>

          <div className="mt-9">
            <HandleLookup />
          </div>
        </div>

        <ProfilePreview />
      </div>
    </section>
  );
}

function ProfilePreview() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-rule bg-surface p-7 shadow-[var(--shadow-lift)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark size={18} closed />
              <span className="figure text-sm text-ink-soft">warung.mirna</span>
            </div>
            <p className="display mt-2 text-3xl">Warung Mirna</p>
            <p className="mt-1 text-sm text-ink-soft">Skincare, Bandung</p>
          </div>
          <ScoreDial score={SAMPLE.total} band={SAMPLE.band} size={110} />
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule">
          <Stat label="Deposit locked" value="$250" tone="bond" />
          <Stat label="Held for" value="74 days" />
          <Stat label="Claims filed" value="3" />
          <Stat label="Paid out" value="0" />
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          Three buyers filed claims. All three were dismissed, and the deposit has
          not been touched since it was funded.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-lg bg-bond-soft px-3.5 py-3 text-sm text-bond">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bond" />
          No withdrawal announced. Cover is in place right now.
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bond" | "notice";
}) {
  const color =
    tone === "bond" ? "text-bond" : tone === "notice" ? "text-notice" : "text-ink";
  return (
    <div className="bg-surface px-4 py-3.5">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className={`figure mt-1 text-lg font-medium ${color}`}>{value}</dd>
    </div>
  );
}

function Situation() {
  return (
    <section className="border-b border-rule bg-paper-deep">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="display max-w-2xl text-[clamp(1.9rem,3.6vw,2.8rem)]">
          Most small commerce here happens with no safety net at all.
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          <Point
            n="01"
            title="The sale leaves no trace"
            body="An order agreed in a chat thread and paid by bank transfer exists nowhere a third party can see. When it goes wrong there is nothing to appeal to."
          />
          <Point
            n="02"
            title="Proof is easy to fake"
            body="Screenshots of past orders, follower counts, testimonial highlights. Every one of them can be bought or edited in a few minutes."
          />
          <Point
            n="03"
            title="Walking away is free"
            body="A seller who disappears loses an account name. Making a new one takes an afternoon. Nothing about that cost scales with how much they took."
          />
        </div>
      </div>
    </section>
  );
}

function Point({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <span className="figure text-sm text-seal">{n}</span>
      <h3 className="mt-3 text-lg font-medium text-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function Mechanism() {
  const steps = [
    {
      title: "The seller locks money they would rather keep",
      body: "A stablecoin deposit goes into the program and stops being spendable. It is held in dollars because a refund owed in rupiah is not covered by collateral that can lose a third of its value between the order and the complaint. The size is theirs to choose, and it is the first thing a buyer sees, so choosing a small one is its own answer.",
      chain: "deposit_bond",
    },
    {
      title: "Buyers read the deposit before paying",
      body: "The profile page pulls straight from the chain: amount, how long it has sat there, every claim and how it ended. No account, no app, no request to us.",
      chain: "read from account",
    },
    {
      title: "A claim that holds up is paid from that deposit",
      body: "The buyer files on chain with a hash of their evidence. An arbiter rules. If the claim stands, the payout leaves the seller's deposit and arrives in the buyer's wallet.",
      chain: "open_dispute → resolve_dispute",
    },
    {
      title: "Leaving takes seven days and cannot be done quietly",
      body: "A seller who wants the deposit back has to announce it. The profile turns amber for the whole notice period, and any open claim freezes the exit until it is settled.",
      chain: "request_withdraw → withdraw_bond",
    },
  ];

  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="display max-w-2xl text-[clamp(1.9rem,3.6vw,2.8rem)]">
          Four moves, all of them on the chain.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          None of these steps route through a balance we control. If Bondmark stopped
          existing tonight, every deposit would still come back on the same schedule.
        </p>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-surface p-8">
              <span className="figure text-sm text-seal">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
              <code className="figure mt-4 inline-block rounded-md bg-paper-deep px-2 py-1 text-xs text-ink-soft">
                {s.chain}
              </code>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Scoring() {
  return (
    <section className="border-b border-rule bg-paper-deep">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <h2 className="display text-[clamp(1.9rem,3.6vw,2.8rem)]">
            One number, and the arithmetic behind it.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            The score is plain arithmetic over six values read off the chain. No model
            sits in the loop, nothing is weighted by hand, and the same record always
            produces the same number. Anyone who wants to check our work can fetch the
            accounts and run the formula themselves.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            A score you cannot recompute is exactly the kind of thing this product
            exists to replace, so leaving it opaque was never an option.
          </p>
          <Link
            href="/formula"
            className="mt-7 inline-flex items-center gap-2 text-[15px] font-medium text-bond underline decoration-bond/30 underline-offset-4 transition-colors hover:decoration-bond"
          >
            Read the full formula
          </Link>
        </div>

        <div className="rounded-2xl border border-rule bg-surface p-7 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">warung.mirna</span>
            <span className="figure text-sm text-ink-faint">
              {SAMPLE.total} / 100
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {SAMPLE.credits.map((line) => (
              <div key={line.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium">{line.label}</span>
                  <span className="figure text-sm text-ink-soft">
                    {line.points} / {line.max}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className="h-full rounded-full bg-bond"
                    style={{ width: `${(line.points / line.max) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
                  {line.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-7 border-t border-rule pt-5 text-xs leading-relaxed text-ink-faint">
            Penalties for open claims, announced withdrawals and past payouts are
            subtracted from this total. This seller currently carries none.
          </p>
        </div>
      </div>
    </section>
  );
}

function BadgeSection() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="display text-[clamp(1.9rem,3.6vw,2.8rem)]">
            Sellers carry the mark where buyers already look.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
            The badge is an image with a link behind it. It goes in a bio, a link
            page, a product photo, a chat reply. Tapping it opens the profile, and
            the profile reads live from the chain, so the badge cannot say one thing
            while the deposit says another.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            A seller who withdraws sees their own badge turn amber. That is the point
            of putting it somewhere public.
          </p>
        </div>

        <div className="flex flex-col items-start gap-5 rounded-2xl border border-rule bg-surface p-8 shadow-[var(--shadow-card)]">
          <div className="inline-flex items-center gap-3 rounded-xl border border-rule bg-paper px-4 py-3">
            <LogoMark size={26} closed />
            <div className="leading-tight">
              <div className="text-[13px] font-medium">$250 bonded</div>
              <div className="figure text-[11px] text-ink-soft">74 days · 0 paid out</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 rounded-xl border border-notice/40 bg-notice-soft px-4 py-3">
            <LogoMark size={26} />
            <div className="leading-tight">
              <div className="text-[13px] font-medium text-notice">
                Withdrawal announced
              </div>
              <div className="figure text-[11px] text-notice/80">
                4d 9h left on the notice
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-ink-faint">
            Both states are generated from the same account data. Nobody chooses which
            one to display.
          </p>
        </div>
      </div>
    </section>
  );
}

function Limits() {
  return (
    <section className="border-b border-rule bg-paper-deep">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="display text-[clamp(1.7rem,3vw,2.3rem)]">
          What a deposit does not do.
        </h2>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <p>
            It does not make a seller honest. It puts a price on dishonesty and shows
            you what that price is. A deposit of $30 says very little about an
            order worth ten times that.
          </p>
          <p>
            It does not cover you beyond the amount locked. If the deposit is $250,
            $250 is the ceiling on what any claim can return, no matter how large the
            order was or how many buyers file.
          </p>
          <p>
            It does not judge quality. A ruling asks whether goods were delivered as
            agreed, not whether they were worth the money.
          </p>
          <p>
            Rulings are made by a human arbiter, and that is the part of the system you
            still have to trust. The deposit, the notice period and the history are
            not. Knowing which half is which is more useful than pretending the whole
            thing is trustless.
          </p>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="display text-[clamp(1.7rem,3vw,2.3rem)]">Check it yourself.</h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          The program is deployed to Solana devnet. Every account this site renders is
          fetched from there and can be opened in an explorer without going through us.
        </p>

        <a
          href={explorerAccount(PROGRAM_ID.toBase58())}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex flex-wrap items-center gap-3 rounded-xl border border-rule bg-surface px-5 py-4 shadow-[var(--shadow-card)] transition-colors hover:border-bond"
        >
          <span className="text-sm text-ink-soft">Program</span>
          <span className="figure break-all text-sm text-ink">
            {PROGRAM_ID.toBase58()}
          </span>
        </a>
      </div>
    </section>
  );
}