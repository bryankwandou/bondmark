import { SiteFooter, SiteNav } from "@/components/site-chrome";

export const metadata = {
  title: "What this does not cover",
  description:
    "The honest boundaries of a refund deposit: what it protects, what it caps, and which part still needs trust.",
};

const SECTIONS = [
  {
    title: "It does not make anyone honest",
    body: "A deposit puts a price on walking away. It does not change who the seller is. What it gives you is a number to weigh against the order in front of you, and the knowledge that the number was expensive for them to post.",
  },
  {
    title: "Cover stops at the amount locked",
    body: "If a seller has $250 bonded, $250 is the most that can ever be returned through claims — not per buyer, but in total. Several buyers filing against the same deposit are drawing from one pot. Judge the deposit against the size of your order, not against the seller's follower count.",
  },
  {
    title: "It is not a verdict on quality",
    body: "A ruling asks whether goods arrived as described and as agreed. It does not ask whether they were worth the price, whether shipping was slow, or whether the seller was pleasant. Those belong in reviews, and reviews are not what this is.",
  },
  {
    title: "The arbiter is a person",
    body: "Rulings are made by a human, and that is the part of this system you still have to trust. The deposit, the seven day notice and the claim history are not: those are enforced by the program and readable by anyone. Knowing exactly which half needs trust is more useful than pretending none of it does.",
  },
  {
    title: "A clean record can just mean an empty one",
    body: "A seller with no claims filed against them and a seller with no customers look identical here. Time bonded is the closest thing to a volume signal we have, which is why it carries weight, but it is not the same as a track record.",
  },
  {
    title: "This is running on devnet",
    body: "Deposits are test funds while the program is being proven out. Nothing on this site is a live financial guarantee yet, and it should not be treated as one.",
  },
];

export default function LimitsPage() {
  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <section className="border-b border-rule">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">
              Where the guarantee ends.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
              A product that oversells its own protection creates exactly the false
              confidence it claims to remove. So here is the short version of what a
              deposit cannot do for you.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-5 py-16">
            <div className="space-y-10">
              {SECTIONS.map((s) => (
                <div key={s.title} className="border-l-2 border-rule-strong pl-6">
                  <h2 className="text-lg font-medium">{s.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}