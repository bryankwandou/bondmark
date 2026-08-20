# Bondmark

**Sellers lock their own money on Solana as a refund guarantee. Buyers check it before paying.**

Live program on devnet: [`5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG`](https://explorer.solana.com/address/5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG?cluster=devnet)

---

## The situation

A large share of small commerce in Indonesia happens outside any marketplace. People
sell through Instagram, TikTok and WhatsApp, and payment is a bank transfer to someone
they have never met. There is no escrow, no rating that carries weight, and no cost to
a seller who takes the money and disappears — losing an account name is not a penalty
when a new one takes an afternoon.

Buyers cope by asking for screenshots of past orders, which anyone can fake in minutes.

## What Bondmark does

A seller deposits a refund bond into a Solana program. That deposit appears on a public
profile page along with how long it has been held and every claim ever filed against it.
The seller links that page from their bio, so a buyer can look before transferring
anything.

When an order goes wrong, the buyer files a claim on chain with a hash of their evidence.
An arbiter rules on it. If the claim holds, the payout leaves the seller's deposit and
lands in the buyer's wallet.

A seller who wants their deposit back has to announce it publicly and wait seven days.
The profile turns amber for that entire window, and any open claim freezes the exit until
it is settled. Nobody withdraws the guarantee on Monday and keeps collecting orders on
Tuesday.

## The score

Buyers see a number from 0 to 100. It is plain arithmetic over six values read off the
chain — no model, no hidden table, no per-seller adjustment. The same record always
produces the same number, and anyone can fetch the accounts and recompute it.

| Component | Weight | How it is measured |
| --- | --- | --- |
| Collateral depth | 40 | Deposit size on a log curve, flattening at $5,000 |
| Time bonded | 25 | Square root of uninterrupted days, saturating at one year |
| Claim outcomes | 25 | Dismissed vs paid out, Laplace smoothed so neither zero claims nor one claim looks conclusive |
| Deposit kept in place | 10 | Share of everything ever deposited that is still locked |
| Unresolved claims | −8 each, capped at −30 | Claims filed and awaiting a ruling |
| Withdrawal announced | −20 | An exit notice is counting down |
| Paid out to buyers | up to −20 | Money already taken from the deposit, relative to lifetime deposits |

An empty deposit scores zero regardless of history. Past tenure is worth nothing to a
buyer who cannot be paid out today.

Implementation: [`src/lib/score.ts`](src/lib/score.ts).

## On-chain design

One `Seller` PDA per handle, seeded on the handle itself, which makes handles unique by
construction and makes the profile URL derivable without a lookup table. The account
owns a vault token account derived from it, so the money and the record it backs are
found by the same derivation and a payout goes through the program rather than a second
account to keep in sync.

One `Dispute` PDA per claim, seeded on the seller and a sequential index. Because indexes
are handed out in order by the program, the full claim history can be walked by anyone
without an indexer.

| Instruction | Signer | Effect |
| --- | --- | --- |
| `register_seller` | seller | Claims a handle, opens an empty record |
| `deposit_bond` | seller | Moves stablecoin into the vault, cancels any pending exit |
| `open_dispute` | buyer | Files a claim with an evidence hash |
| `resolve_dispute` | arbiter | Pays the buyer from the deposit, or dismisses |
| `request_withdraw` | seller | Starts the seven day notice, blocked by open claims |
| `withdraw_bond` | seller | Returns funds once the notice elapses |

Source: [`anchor/programs/bondmark/src`](anchor/programs/bondmark/src).

## What this does not cover

- It does not make a seller honest. It puts a price on dishonesty and shows you the price.
- Cover is capped at the deposit. A $250 bond returns at most $250 in total, however
  large the order or however many buyers file.
- Rulings are made by a human arbiter. That is the part you still have to trust; the
  deposit, the notice period and the history are not.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL if you want profile metadata
npm run dev
```

Program:

```bash
cd anchor
anchor build
anchor deploy --provider.cluster devnet
```

## Stack

Next.js App Router, Tailwind v4 with hand-rolled tokens, Anchor 1.0 on Solana devnet,
Neon Postgres for profile metadata and claim evidence. Account decoding is written by
hand rather than through the Anchor client, which keeps the runtime out of the browser
bundle and out of every serverless cold start.

Groq is used for exactly one thing: a short plain-language summary of a seller's claim
history, cached for 24 hours. The product works normally without it, and nothing it
produces affects the score.