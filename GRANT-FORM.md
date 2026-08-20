# Agentic Engineering Grant — isian form

Grant amount: **200 USDG** (fixed, per form). 100 di depan, 100 setelah live.
Revisi terakhir: 20 Agustus 2026, setelah bond dipindah dari SOL ke stablecoin.

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

---

## STEP 2 — Details

**Project Details**

```
Most small commerce in Indonesia happens outside any marketplace. People sell through
Instagram, TikTok and WhatsApp, and payment is a bank transfer to someone they have
never met. There is no escrow, no rating that carries any weight, and no cost to a
seller who takes the money and goes quiet. Losing an account name is not a penalty
when a new one takes an afternoon to build. Buyers cope by asking for screenshots of
past orders, which anyone can fake in minutes.

Bondmark gives a seller a way to put money behind their word. The seller deposits a
refund bond into a Solana program. That deposit appears on a public profile page along
with how long it has been held and every claim ever filed against it. The seller links
that page from their bio, so a buyer can look before transferring anything.

The bond is held in a stablecoin, not in SOL. A buyer owed a refund in rupiah is not
covered by collateral that can lose a third of its value between the order and the
complaint, so the guarantee is denominated in the same kind of money the refund is
measured in.

When an order goes wrong, the buyer files a claim on chain with a hash of their
evidence. An arbiter rules on it. If the claim holds, the payout leaves the seller's
vault and lands in the buyer's token account. A seller who wants their deposit back has
to announce it publicly and wait seven days, and the profile turns amber for that whole
window. Any open claim freezes the exit until it is settled. Nobody withdraws the
guarantee on Monday and keeps collecting orders on Tuesday.

Buyers see a score from 0 to 100, computed from six values read off the chain: deposit
size on a log curve, uninterrupted time bonded, claim outcomes with Laplace smoothing,
share of deposits still in place, unresolved claims, and payouts already made. It is
plain arithmetic with no model in the loop, published on the site, and recomputable by
anyone who fetches the accounts. A trust signal the person relying on it cannot check
is the thing this product replaces, so leaving it opaque was never an option.
```

**Deadline (Asia/Makassar)**
```
September 17, 2026
```

**Proof of Work**

```
Anchor program deployed and live on Solana devnet, built from scratch during this
session:

5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG
https://explorer.solana.com/address/5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG?cluster=devnet

First deploy:
https://explorer.solana.com/tx/wvi9Qfuvqm9uou69x2Rj9mwYdFVtr9w79tTL8RB1zEmRDw6GGii4vRJRcUpA3DU9aBMqYLV2UmPkPfoN5KTCGHp?cluster=devnet

Upgrade that moved bonds from native SOL to a stablecoin vault:
https://explorer.solana.com/tx/4ncN3M7tnzHhfvDms5y5fAAiooha51JijX3mdGsafRY26qXA1cs3gkyxx8gCk2GG8EGMjNWSSiHE6wgn7zyUgvxR?cluster=devnet

A seller registered and a $250 bond locked against the deployed program:
register_seller  VtVAiSsmJx9X48xPvipEpGe41aJ1z2vbSE2cpNiDcMX2V2bTEBx7Z3LhE4wUCCcsZXnzLTYMLVaygkYLWSEhuQJ
deposit_bond     2DDxyCoPh8wh11evHG5qQXkgegXhMDx7KzxvgJmfShTTGgsbLeHorB85R9jaWDVjMzvNFdd6wzSRBjjeUWuab2nE
seller record    oTYPrCiUgNKzfbtv4sDR91PkZotcuHKyjtTCthjzyLq
vault            HJ3RXB9Mu554FxaNdMnMuuqhnyGFhHsJwSGVJo7HF746

The site renders those exact accounts, read from the chain on every request:
https://bondmark.vercel.app/s/warung.mirna

Source, public:
https://github.com/bryankwandou/bondmark

Six instructions are implemented and deployed: register_seller, deposit_bond,
open_dispute, resolve_dispute, request_withdraw, withdraw_bond. The seven day exit
notice and the freeze on withdrawals while a claim is open are enforced by the program
itself, not by the frontend. The vault's authority is the seller record, so a payout
can only move through the program's rules.

The trust score is deterministic TypeScript over on-chain account data, published in
full at src/lib/score.ts rather than described in prose.

Prior shipped work: several Solana and web projects built and deployed over the past
months, listed on the GitHub profile above.
```

**Personal X Profile**
```
x.com/nayrbryanGaming
```

**Personal GitHub Profile** — harus `bryankwandou`, bukan `nayrbryanGaming`.
```
github.com/bryankwandou
```

**Link (response files)**
```
https://bondmark-submission.vercel.app
```

---

## STEP 3 — Milestones

```
Milestone 1 — On-chain core. Done, 20 August 2026.
Anchor program written from scratch and deployed to Solana devnet at
5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG. Six instructions: register_seller,
deposit_bond, open_dispute, resolve_dispute, request_withdraw, withdraw_bond. Seller
and Dispute records are PDAs and the bond sits in a vault token account the seller
record signs for, so the money and the reputation it backs cannot drift apart. The
seven day exit notice and the freeze on withdrawal while a claim is open are enforced
by the program, not by the frontend. Registering a seller and locking a $250 stablecoin
bond have both been executed against the deployed program and are verifiable on the
explorer. The public site reads those accounts live at
bondmark.vercel.app/s/warung.mirna.

Milestone 2 — Claim cycle proven end to end. By 27 August 2026.
Run the full dispute path on devnet from two separate wallets: a buyer files a claim
with an evidence hash, the arbiter rules, and the payout leaves the seller's vault and
lands in the buyer's token account. Both outcomes demonstrated, dismissed and slashed,
each with a transaction link. This is the claim the whole product rests on, so it gets
shown rather than described.

Milestone 3 — Signing in the browser. By 3 September 2026.
Wallet connection on the site so a seller registers, tops up, announces an exit and
withdraws without touching a terminal, and a buyer files a claim the same way. Until
this lands the dashboard says plainly that signing is not wired up, rather than
offering a button that fails.

Milestone 4 — The badge and the profile. By 10 September 2026.
Embeddable SVG badge generated from account data, so a seller drops it into an
Instagram or TikTok bio and it cannot show a healthy state while the deposit says
otherwise. Neon Postgres for the parts that are presentation only: shop name, photo,
links. Anything that moves the score stays on chain. Mainnet bonds switch to Circle
USDC; devnet keeps a test mint because Circle's devnet USDC cannot be minted on demand.

Milestone 5 — Sellers on it, and hand over. By 17 September 2026.
Onboard real sellers, publish a short walkthrough, and submit the repo, the live URL
and the subscription receipts for the second tranche.
```

**Primary KPI**
```
Sellers holding a funded bond continuously for 14 days or more. Target: 25 by
17 September.
```

---

## Tautan final (sudah live)

- Aplikasi: https://bondmark.vercel.app
- Submission / response files: https://bondmark-submission.vercel.app
- Repo publik: https://github.com/bryankwandou/bondmark
- Program devnet: https://explorer.solana.com/address/5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG?cluster=devnet
- Profil demo: https://bondmark.vercel.app/s/warung.mirna

---

## Catatan sebelum kirim

- Handle demo sekarang `warung.mirna`, bukan `warungmirna`. Akun lama masih ada di
  devnet dengan layout SOL yang sudah tidak dipakai; jangan dipakai sebagai bukti.
- Repo public, jadi syarat berbagi akses ke `abhwshek@gmail.com` tidak berlaku.
- Struk langganan harus total 200 USD. Simpan invoice-nya sekarang.
- Jangan menulis "$10" di mana pun. Form menyebut 200 USDG.
