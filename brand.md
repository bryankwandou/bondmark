# Bondmark — brand

## The one idea

A bond certificate, not a crypto dashboard. The product's whole claim is that
someone's own money is sitting behind their word, so the surface should feel closer
to a notarised document than to a trading terminal. Warm paper, dense ink, restrained
colour, and figures set in monospace so they read as amounts rather than decoration.

## Name

**Bondmark.** "Bond" is the mechanism: money locked and slashable. "Mark" is the
product: the badge a buyer looks at. The name states what it does without needing a
tagline, and it was clear on GitHub, npm and Vercel at the time it was chosen.

## Palette

Light is the default. The product is checked on a phone, often outdoors, by someone
deciding whether to transfer money — legibility beats atmosphere.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--paper` | `#F6F4EF` | `#0B0E12` | Page ground |
| `--surface` | `#FFFFFF` | `#141920` | Cards, panels |
| `--ink` | `#12171E` | `#EDEAE3` | Primary text |
| `--ink-soft` | `#5A636E` | `#9AA3AE` | Secondary text |
| `--rule` | `#E2DED4` | `#232A33` | Hairlines, borders |
| `--bond` | `#0E7C66` | `#2AA98D` | Money that is locked; the primary action |
| `--seal` | `#B08428` | `#D6A93F` | The mark itself, verification, accents |
| `--notice` | `#B4661A` | `#E08A32` | Withdrawal announced, amber state |
| `--claim` | `#9E2B2B` | `#D65C5C` | Paid out, slashed, danger |

Two accents, not one. `--bond` carries every action that involves value moving;
`--seal` carries identity and verification. Keeping them apart is what stops the
interface from turning into one flat wash of brand colour.

## Type

- **Display — Instrument Serif.** Gives headlines the weight of a printed
  instrument. Used at large sizes only, never below 24px.
- **Interface — Geist Sans.** Neutral, tight, gets out of the way.
- **Figures — Geist Mono, tabular.** Every SOL amount, score, countdown and address.
  Numbers that shift width while they update undermine the point of the product.

## Rules that hold everywhere

1. A score is never shown without its breakdown one tap away. An unexplained number
   is the thing we are replacing, not the thing we are selling.
2. Amber and red states are never quieter than green ones. A withdrawal notice must
   be at least as loud as a healthy badge.
3. No emoji anywhere in product surfaces.
4. Every on-chain figure carries a link to the explorer. If we show it, it can be
   checked without us.
5. Motion is used to show causation — a value moving, a state changing — never to
   decorate an entrance.
6. Copy is plain and specific. "Seller locked 4 SOL 62 days ago" beats "Verified
   seller". Numbers persuade; adjectives do not.

## Voice

Direct, unhedged, slightly dry. Address the reader as a person about to spend money.
Say what the mechanism does and what it does not cover. Never oversell the guarantee:
the deposit is a cap on loss, not insurance, and the copy should say so where it
matters.
