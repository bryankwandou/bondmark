/**
 * Bondmark trust score.
 *
 * Every input below is read from accounts on Solana devnet. Nothing here calls a
 * model, reads a hidden table, or varies with who is asking. Feed the same seller
 * record in twice and you get the same number twice, which is the only reason a
 * buyer has any business relying on it.
 *
 * The breakdown published at /formula renders straight out of these functions, so
 * the explanation and the arithmetic can never drift apart.
 */

/**
 * Bonds are denominated in a stablecoin with six decimals. A refund a buyer is
 * owed in rupiah is not covered by a deposit that can lose a third of its value
 * between the order and the complaint, so the collateral is held in the same
 * kind of money the refund is measured in.
 */
export const UNITS_PER_USD = 1_000_000;

/** Mirrors MIN_BOND_UNITS in the on-chain program. */
export const MIN_BOND_USD = 25;

/** Deposit size at which collateral depth stops earning further points. */
export const BOND_CEILING_USD = 5_000;

export type SellerRecord = {
  bond: bigint;
  lifetimeDeposited: bigint;
  slashedTotal: bigint;
  registeredAt: number;
  bondedSince: number;
  disputesOpened: number;
  disputesSlashed: number;
  disputesDismissed: number;
  openDisputes: number;
  withdrawUnlockAt: number;
};

export type ScoreLine = {
  key: string;
  label: string;
  detail: string;
  points: number;
  max: number;
};

export type Band = "unbonded" | "thin" | "building" | "solid" | "strong";

export type ScoreResult = {
  total: number;
  band: Band;
  credits: ScoreLine[];
  penalties: ScoreLine[];
  /** No money stands behind the profile at all. */
  unbonded: boolean;
  /** A seven day exit notice is currently counting down. */
  exiting: boolean;
};

export const BAND_COPY: Record<Band, { title: string; blurb: string }> = {
  unbonded: {
    title: "No deposit",
    blurb: "Nothing is locked behind this profile. Treat it like any anonymous account.",
  },
  thin: {
    title: "Thin cover",
    blurb: "A deposit exists but it is small or very new. Reasonable for small orders, not large ones.",
  },
  building: {
    title: "Building",
    blurb: "Real money has been locked for a while and no claim has been paid out of it.",
  },
  solid: {
    title: "Solid",
    blurb: "A meaningful deposit, held long enough that walking away would cost more than it saves.",
  },
  strong: {
    title: "Strong",
    blurb: "Deep cover, long tenure, and claims that closed without touching the deposit.",
  },
};

const DAY = 86_400;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export const unitsToUsd = (n: bigint) => Number(n) / UNITS_PER_USD;

/**
 * How much money is actually at stake, on a log curve.
 *
 * Linear would misread the risk: going from nothing to $50 changes a buyer's
 * exposure far more than going from $2,000 to $2,050. The curve saturates at
 * BOND_CEILING_USD so a large wallet cannot simply buy a perfect score.
 */
function collateralDepth(bondUsd: number): ScoreLine {
  const max = 40;
  const ratio =
    bondUsd <= 0
      ? 0
      : Math.log10(1 + bondUsd / MIN_BOND_USD) /
        Math.log10(1 + BOND_CEILING_USD / MIN_BOND_USD);
  return {
    key: "collateral",
    label: "Collateral depth",
    detail: `$${round1(bondUsd)} locked, on a log curve that flattens at $${BOND_CEILING_USD.toLocaleString("en-US")}`,
    points: round1(max * clamp(ratio, 0, 1)),
    max,
  };
}

/**
 * Time the deposit has sat there without interruption.
 *
 * Square root rather than linear: the first weeks are what separate a seller from
 * someone who registered this morning, and past a year more time adds little. A
 * full exit resets bondedSince on chain, so tenure cannot be recycled.
 */
function tenure(bondedSince: number, now: number): ScoreLine {
  const max = 25;
  const days = bondedSince > 0 ? Math.max(0, (now - bondedSince) / DAY) : 0;
  const whole = Math.floor(days);
  return {
    key: "tenure",
    label: "Time bonded",
    detail:
      days < 1
        ? "Deposit was funded today"
        : `${whole} day${whole === 1 ? "" : "s"} of uninterrupted cover`,
    points: round1(max * clamp(Math.sqrt(days / 365), 0, 1)),
    max,
  };
}

/**
 * Claim outcomes, smoothed.
 *
 * A seller with one dismissed claim is not proven, and a seller with no claims at
 * all is not proven either. Adding one imaginary win and one imaginary loss pulls
 * both toward the middle and lets real evidence move the number from there.
 */
function claimRecord(dismissed: number, slashed: number): ScoreLine {
  const max = 25;
  const resolved = dismissed + slashed;
  const cleanRatio = (dismissed + 1) / (resolved + 2);
  return {
    key: "claims",
    label: "Claim outcomes",
    detail:
      resolved === 0
        ? "No claim has been ruled on yet, so this sits at the neutral midpoint"
        : `${dismissed} dismissed, ${slashed} paid out of the deposit`,
    points: round1(max * cleanRatio),
    max,
  };
}

/**
 * Share of everything ever deposited that is still on the line. Catches the
 * pattern where a seller funds a large bond, collects the badge and the orders,
 * then quietly walks most of it back out.
 */
function retention(bondUsd: number, lifetimeUsd: number): ScoreLine {
  const max = 10;
  const ratio = lifetimeUsd <= 0 ? 0 : clamp(bondUsd / lifetimeUsd, 0, 1);
  return {
    key: "retention",
    label: "Deposit kept in place",
    detail:
      lifetimeUsd <= 0
        ? "Nothing has been deposited yet"
        : `${Math.round(ratio * 100)}% of the $${round1(lifetimeUsd)} ever deposited is still locked`,
    points: round1(max * ratio),
    max,
  };
}

/** Unresolved claims are the loudest live signal there is. */
function openClaims(open: number): ScoreLine | null {
  if (open <= 0) return null;
  return {
    key: "open",
    label: "Unresolved claims",
    detail: `${open} claim${open === 1 ? "" : "s"} filed and still waiting on a ruling`,
    points: -Math.min(30, open * 8),
    max: -30,
  };
}

/** An announced exit becomes public the moment it starts, not after it completes. */
function exitNotice(withdrawUnlockAt: number, now: number): ScoreLine | null {
  if (withdrawUnlockAt <= 0) return null;
  const hoursLeft = Math.max(0, (withdrawUnlockAt - now) / 3600);
  return {
    key: "exit",
    label: "Withdrawal announced",
    detail:
      hoursLeft > 0
        ? `Seller has begun pulling the deposit out, ${Math.ceil(hoursLeft)}h left on the notice`
        : "The notice period has elapsed; the deposit can leave at any moment",
    points: -20,
    max: -20,
  };
}

/** Money that actually left the deposit and reached a buyer. */
function slashHistory(slashedUsd: number, lifetimeUsd: number): ScoreLine | null {
  if (slashedUsd <= 0) return null;
  const ratio = lifetimeUsd <= 0 ? 1 : clamp(slashedUsd / lifetimeUsd, 0, 1);
  return {
    key: "slashed",
    label: "Paid out to buyers",
    detail: `$${round1(slashedUsd)} has been taken from this deposit and handed to buyers`,
    points: -round1(20 * ratio),
    max: -20,
  };
}

function bandFor(total: number, bond: bigint): Band {
  if (bond <= 0n) return "unbonded";
  if (total >= 80) return "strong";
  if (total >= 60) return "solid";
  if (total >= 40) return "building";
  return "thin";
}

export function scoreSeller(s: SellerRecord, nowSeconds?: number): ScoreResult {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const bondUsd = unitsToUsd(s.bond);
  const lifetimeUsd = unitsToUsd(s.lifetimeDeposited);
  const slashedUsd = unitsToUsd(s.slashedTotal);

  const credits: ScoreLine[] = [
    collateralDepth(bondUsd),
    tenure(s.bondedSince, now),
    claimRecord(s.disputesDismissed, s.disputesSlashed),
    retention(bondUsd, lifetimeUsd),
  ];

  const penalties = [
    openClaims(s.openDisputes),
    exitNotice(s.withdrawUnlockAt, now),
    slashHistory(slashedUsd, lifetimeUsd),
  ].filter((x): x is ScoreLine => x !== null);

  const raw =
    credits.reduce((a, c) => a + c.points, 0) +
    penalties.reduce((a, p) => a + p.points, 0);

  // An empty deposit scores zero no matter what the history says. Past tenure is
  // worth nothing to a buyer who cannot be paid out today.
  const total = s.bond <= 0n ? 0 : Math.round(clamp(raw, 0, 100));

  return {
    total,
    band: bandFor(total, s.bond),
    credits,
    penalties,
    unbonded: s.bond <= 0n,
    exiting: s.withdrawUnlockAt > 0,
  };
}
