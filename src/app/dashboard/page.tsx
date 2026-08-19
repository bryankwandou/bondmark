import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { LogoMark } from "@/components/logo";
import { PROGRAM_ID, explorerAccount } from "@/lib/solana/bondmark";

export const metadata = {
  title: "For sellers",
  description:
    "How to lock a refund deposit, what it costs you, and what it changes for the people deciding whether to pay you.",
};

const STEPS = [
  {
    n: "01",
    title: "Claim a handle",
    body: "Pick the name buyers already know you by. It becomes your profile address and it cannot be taken by anyone else, because the account is derived from the handle itself.",
    call: "register_seller(handle, arbiter)",
  },
  {
    n: "02",
    title: "Decide what you are willing to put up",
    body: "The minimum is 0.1 SOL, but the minimum is also a statement. Buyers see the figure before they see anything else you have written, and a small deposit against large orders answers its own question.",
    call: "deposit_bond(amount)",
  },
  {
    n: "03",
    title: "Put the mark where buyers already look",
    body: "Bio link, product photo, the reply you send when someone asks whether you are trustworthy. It costs nothing to show and it is the only claim about you that a stranger can check.",
    call: "read from account",
  },
  {
    n: "04",
    title: "Leaving takes a week, and it is visible",
    body: "You can always get your deposit back. You announce it, the profile turns amber, and after seven days the funds are yours. Any claim still open holds the exit until it is settled.",
    call: "request_withdraw() → withdraw_bond(amount)",
  },
];

export default function DashboardPage() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-rule">
          <div className="ledger-ground pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-5 py-20">
            <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">
              Say something about yourself
              <br />
              that costs you money to say.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
              Anyone can write that they are trustworthy. Almost nobody will lock their
              own money against being wrong about it. That gap is the entire signal, and
              it is why a deposit persuades a stranger when a wall of testimonials does
              not.
            </p>
          </div>
        </section>

        <section className="border-b border-rule bg-paper-deep">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <ol className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2">
              {STEPS.map((s) => (
                <li key={s.n} className="bg-surface p-7">
                  <span className="figure text-sm text-seal">{s.n}</span>
                  <h2 className="mt-3 text-lg font-medium">{s.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                  <code className="figure mt-4 inline-block rounded-md bg-paper-deep px-2 py-1 text-xs text-ink-soft">
                    {s.call}
                  </code>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-rule">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <div className="rounded-2xl border border-rule bg-surface p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <LogoMark size={26} />
                <h2 className="text-lg font-medium">Wallet signing is landing next</h2>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                The program is deployed and every instruction works. What is not wired
                up yet is browser signing, so registering and depositing currently
                happen through the Anchor client rather than through this page. That is
                the next thing being built, and this page will do the signing itself
                when it lands.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                Saying so plainly seemed better than putting a button here that opens a
                wallet and then fails.
              </p>

              <a
                href={explorerAccount(PROGRAM_ID.toBase58())}
                target="_blank"
                rel="noreferrer"
                className="figure mt-6 inline-block break-all rounded-lg border border-rule bg-paper px-4 py-3 text-sm transition-colors hover:border-bond"
              >
                {PROGRAM_ID.toBase58()}
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}