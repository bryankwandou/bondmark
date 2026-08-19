import Link from "next/link";
import { notFound } from "next/navigation";

import { ScoreDial } from "@/components/score-dial";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { formatDate, formatSol, shortKey, timeAgo, timeLeft } from "@/lib/format";
import { BAND_COPY, scoreSeller } from "@/lib/score";
import {
  explorerAccount,
  fetchDisputes,
  fetchSeller,
  type DisputeAccount,
} from "@/lib/solana/bondmark";

// Deposits and claims change on chain without telling us, so the page is rebuilt
// on a short interval rather than cached indefinitely.
export const revalidate = 30;

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params) {
  const { handle } = await params;
  return {
    title: `${handle} — deposit and claim history`,
    description: `What ${handle} has locked as a refund guarantee on Solana, and every claim filed against it.`,
  };
}

export default async function SellerProfile({ params }: Params) {
  const { handle } = await params;

  const seller = await fetchSeller(handle).catch(() => null);
  if (!seller) notFound();

  const disputes = await fetchDisputes(seller).catch(() => [] as DisputeAccount[]);
  const score = scoreSeller(seller);
  const band = BAND_COPY[score.band];

  return (
    <>
      <SiteNav />

      <main className="flex-1">
        <section className="border-b border-rule">
          <div className="mx-auto max-w-4xl px-5 py-12">
            {score.exiting && <ExitBanner unlockAt={seller.withdrawUnlockAt} />}

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="figure text-sm text-ink-soft">{seller.handle}</span>
                <h1 className="display mt-2 text-[clamp(2.2rem,5vw,3.4rem)]">
                  {band.title}
                </h1>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
                  {band.blurb}
                </p>
              </div>

              <ScoreDial
                score={score.total}
                band={score.band}
                exiting={score.exiting}
              />
            </div>

            <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
              <Cell
                label="Locked now"
                value={`${formatSol(seller.bond)} SOL`}
                tone={seller.bond > 0n ? "bond" : "faint"}
              />
              <Cell
                label="Bonded since"
                value={
                  seller.bondedSince > 0 ? formatDate(seller.bondedSince) : "not funded"
                }
              />
              <Cell label="Claims filed" value={String(seller.disputesOpened)} />
              <Cell
                label="Paid out"
                value={`${formatSol(seller.slashedTotal)} SOL`}
                tone={seller.slashedTotal > 0n ? "claim" : undefined}
              />
            </dl>
          </div>
        </section>

        <section className="border-b border-rule bg-paper-deep">
          <div className="mx-auto max-w-4xl px-5 py-12">
            <h2 className="display text-2xl">How this number was reached</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Every line below is arithmetic over data on the chain.{" "}
              <Link
                href="/formula"
                className="text-bond underline decoration-bond/30 underline-offset-4"
              >
                The full formula is published here.
              </Link>
            </p>

            <div className="mt-8 space-y-6">
              {score.credits.map((line) => (
                <div key={line.key}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium">{line.label}</span>
                    <span className="figure text-sm text-ink-soft">
                      {line.points} / {line.max}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rule">
                    <div
                      className="h-full rounded-full bg-bond"
                      style={{ width: `${Math.max(0, (line.points / line.max) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
                    {line.detail}
                  </p>
                </div>
              ))}

              {score.penalties.map((line) => (
                <div key={line.key} className="rounded-lg bg-claim-soft px-4 py-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-claim">{line.label}</span>
                    <span className="figure text-sm text-claim">{line.points}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-claim/80">
                    {line.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-rule">
          <div className="mx-auto max-w-4xl px-5 py-12">
            <h2 className="display text-2xl">Claims</h2>

            {disputes.length === 0 ? (
              <p className="mt-4 text-[15px] text-ink-soft">
                Nobody has filed a claim against this deposit. That is a shorter record
                than it looks: a seller with no orders and a seller with no complaints
                are indistinguishable here.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {disputes.map((d) => (
                  <ClaimRow key={d.address} dispute={d} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-5 py-12">
            <h2 className="display text-2xl">Verify without us</h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2">
              <ChainLink label="Seller account" address={seller.address} />
              <ChainLink label="Controlled by" address={seller.owner} />
              <ChainLink label="Arbiter" address={seller.arbiter} />
              <div className="bg-surface px-4 py-3.5">
                <div className="text-xs text-ink-faint">Registered</div>
                <div className="figure mt-1 text-sm">
                  {formatDate(seller.registeredAt)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function ExitBanner({ unlockAt }: { unlockAt: number }) {
  return (
    <div className="mb-8 rounded-xl border border-notice/40 bg-notice-soft px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-medium text-notice">
          This seller has announced they are pulling their deposit out.
        </span>
        <span className="figure text-sm text-notice">{timeLeft(unlockAt)}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-notice/85">
        Once the notice elapses the money can leave at any moment. Anything you order
        between now and then may finish with no cover behind it.
      </p>
    </div>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bond" | "claim" | "faint";
}) {
  const color =
    tone === "bond"
      ? "text-bond"
      : tone === "claim"
        ? "text-claim"
        : tone === "faint"
          ? "text-ink-faint"
          : "text-ink";
  return (
    <div className="bg-surface px-4 py-4">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className={`figure mt-1 text-lg font-medium ${color}`}>{value}</dd>
    </div>
  );
}

const CLAIM_LABEL = {
  open: { text: "Awaiting a ruling", cls: "text-notice bg-notice-soft" },
  dismissed: { text: "Dismissed", cls: "text-ink-soft bg-paper-deep" },
  slashed: { text: "Paid to the buyer", cls: "text-claim bg-claim-soft" },
} as const;

function ClaimRow({ dispute }: { dispute: DisputeAccount }) {
  const label = CLAIM_LABEL[dispute.status];
  return (
    <li className="rounded-xl border border-rule bg-surface px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className={`rounded-md px-2 py-1 text-xs font-medium ${label.cls}`}>
          {label.text}
        </span>
        <span className="figure text-sm">{formatSol(dispute.amount)} SOL claimed</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-faint">
        <span>Filed {timeAgo(dispute.openedAt)}</span>
        <span className="figure">by {shortKey(dispute.buyer)}</span>
        {dispute.resolvedAt > 0 && <span>Ruled {timeAgo(dispute.resolvedAt)}</span>}
        <a
          href={explorerAccount(dispute.address)}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-rule-strong underline-offset-2 hover:text-ink"
        >
          On chain
        </a>
      </div>
    </li>
  );
}

function ChainLink({ label, address }: { label: string; address: string }) {
  return (
    <a
      href={explorerAccount(address)}
      target="_blank"
      rel="noreferrer"
      className="bg-surface px-4 py-3.5 transition-colors hover:bg-paper-deep"
    >
      <div className="text-xs text-ink-faint">{label}</div>
      <div className="figure mt-1 break-all text-sm">{shortKey(address, 8, 8)}</div>
    </a>
  );
}
