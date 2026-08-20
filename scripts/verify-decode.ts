/** Sanity check that the hand-rolled decoder matches what the program wrote. */
import { fetchSeller } from "../src/lib/solana/bondmark";
import { scoreSeller } from "../src/lib/score";

async function main() {
  const s = await fetchSeller("warung.mirna");
  if (!s) {
    console.log("no seller found");
    return;
  }
  console.log("handle          ", s.handle);
  console.log("owner           ", s.owner);
  console.log("bond (base units)", s.bond.toString());
  console.log("lifetime        ", s.lifetimeDeposited.toString());
  console.log("slashed         ", s.slashedTotal.toString());
  console.log("registeredAt    ", new Date(s.registeredAt * 1000).toISOString());
  console.log("bondedSince     ", new Date(s.bondedSince * 1000).toISOString());
  console.log("disputes        ", s.disputesOpened, s.disputesDismissed, s.disputesSlashed, s.openDisputes);
  console.log("withdrawUnlockAt", s.withdrawUnlockAt);
  const sc = scoreSeller(s);
  console.log("score           ", sc.total, sc.band);
  for (const c of sc.credits) console.log("  +", c.label, c.points, "/", c.max);
}

main().catch((e) => { console.error(e); process.exit(1); });
