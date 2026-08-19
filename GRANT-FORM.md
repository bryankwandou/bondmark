# Agentic Engineering Grant — isian form

Grant amount: **200 USDG** (fixed, per form). 100 di depan, 100 setelah live.

---

## STEP 1 — Basics

**Project Title**
```
Bondmark
```

**One Line Description**
```
Online sellers lock their own money on Solana as a refund guarantee, and buyers can check it before paying.
```

**TG username** — sudah terisi: `nayrbryan_gaming`

**Wallet Address** — sudah terisi: `BNmWym2gZbNuTFmKBKw7jh6TXBPo52MCwh8sYLwuLMh9`

> Cek sekali lagi bahwa wallet ini punya Anda dan bukan wallet yang private key-nya
> pernah tersimpan di file teks. Ini alamat tujuan pembayaran grant.

---

## STEP 2 — Details

**What are you building?**

```
Most small commerce in Indonesia happens outside any marketplace. People sell through
Instagram, TikTok and WhatsApp, and payment is a bank transfer to a stranger. There is
no escrow, no rating that carries weight, and no cost to a seller who takes the money
and disappears. Buyers cope by asking for proof of past orders, which is trivially
faked.

Bondmark gives a seller a way to put money behind their word. The seller deposits a
refund bond into a Solana program. That deposit shows up on a public profile page,
along with how long it has been sitting there and every claim ever filed against it.
The seller links that page from their bio, so a buyer can look before transferring
anything.

If an order goes wrong, the buyer files a claim on chain. An arbiter rules on it. If
the claim holds, the payout comes straight out of the seller's deposit and lands in
the buyer's wallet. If the seller wants their deposit back, they have to announce it
publicly and wait seven days, and the profile turns amber for that entire window. A
seller cannot quietly withdraw the guarantee on Monday and keep collecting orders on
Tuesday.

The number buyers see is a trust score from 0 to 100, computed from six on-chain
inputs: deposit size on a log curve, uninterrupted time bonded, claim outcomes with
Laplace smoothing, share of deposits still in place, unresolved claims, and any
payouts already made. The formula is published on the site and runs on data anyone
can read off the chain. There is no model in the loop and no hidden reputation table,
because a trust signal that cannot be recomputed by the person relying on it is not
worth much.
```

**Why Solana?**

```
Three properties of the chain are doing actual work here, not decorating a demo.

First, the deposit has to be visible to a buyer who has no relationship with us. A
balance held in our own database would be a claim we make about ourselves. Held in a
program account, the buyer verifies it on an explorer and never has to take our word
for anything.

Second, we cannot be able to touch the money. The rules that release a deposit are in
the program: notice period, no open claims, owner signature. We could shut down
tomorrow and every seller would still get their deposit back on schedule.

Third, the economics only work at Solana fee levels. A deposit, a claim and a ruling
might total well under a cent in fees. On a chain where each of those costs dollars,
a guarantee backed by a 500,000 rupiah deposit stops making sense.
```

**How will you use AI coding tools?**

```
The build runs on Claude Code as the primary environment: the Anchor program, the
Next.js frontend, the scoring module and the schema were all written in it, with me
directing scope and reviewing every diff before it lands.

Where I deliberately did not use AI is inside the product. The trust score is plain
arithmetic in TypeScript with unit tests, not a model call, so it stays auditable and
gives the same answer every time. The single AI feature is a short plain-language
summary of a seller's claim history, cached and refreshed at most once a day, and the
whole product works normally when it is unavailable.

The subscription pays for the build loop, not for runtime inference.
```

---

## STEP 3 — Milestones

**Milestone 1 — On-chain core (done)**
```
Anchor program live on Solana devnet with six instructions: register a seller, deposit
a bond, file a claim, rule on a claim, announce a withdrawal, complete a withdrawal.
Seller and Dispute accounts as PDAs, seven day exit notice enforced by the program,
payouts moved from the seller's account balance to the buyer's wallet.
Deliverable: program ID on devnet plus an explorer link for each instruction type.
```

**Milestone 2 — Public trust surface**
```
Seller profile page at /s/[handle] reading live account data, deterministic trust score
with the full breakdown shown line by line, published formula page, and an embeddable
SVG badge that a seller drops into an Instagram or TikTok bio link.
Deliverable: live URL with at least one funded seller and one resolved claim visible.
```

**Milestone 3 — Both sides of the flow**
```
Seller dashboard for registering, topping up, and announcing an exit. Buyer flow for
filing a claim with an evidence hash. Arbiter view for ruling. Neon Postgres for
profile metadata and evidence text, with on-chain data as the source of truth for
anything that affects the score.
Deliverable: end-to-end run recorded, wallet to wallet, on devnet.
```

**Milestone 4 — Ship and hand over**
```
Deployed on Vercel, public GitHub repo, README with the scoring formula written out,
and a short walkthrough video. Repo access shared with abhwshek@gmail.com if it is
ever made private.
Deliverable: live URL, repo URL, subscription receipts.
```

---

## Catatan sebelum kirim

- Repo akan public, jadi syarat berbagi akses ke `abhwshek@gmail.com` tidak berlaku.
- Struk langganan harus total 200 USD. Simpan invoice-nya sekarang, jangan cari saat
  tranche kedua.
- Jangan menulis "$10" di mana pun. Form menyebut 200 USDG.
