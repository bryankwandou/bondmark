import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Read side of the Bondmark program.
 *
 * Accounts are decoded by hand rather than through the Anchor client. The layouts
 * are small and stable, and doing it this way keeps the whole Anchor runtime out
 * of the browser bundle and out of every serverless cold start. If a field is ever
 * added to the program, it gets added here in the same order and nowhere else.
 */

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? "5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG",
);

export const CLUSTER = "devnet" as const;

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

const SELLER_SEED = Buffer.from("seller");
const DISPUTE_SEED = Buffer.from("dispute");
const VAULT_SEED = Buffer.from("vault");

/**
 * The stablecoin every bond is denominated in on this deployment. Devnet has no
 * mintable Circle USDC, so this is our own six-decimal test mint; mainnet swaps
 * the address and nothing else.
 */
export const BOND_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_BOND_MINT ?? "3q7LeeY51YvVHRC5MFJVSPpPx8pJ8ZFq31vbjzriRMrk",
);

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, "confirmed");
  }
  return connection;
}

export function sellerPda(handle: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [SELLER_SEED, Buffer.from(handle)],
    PROGRAM_ID,
  )[0];
}

export function disputePda(seller: PublicKey, index: number): PublicKey {
  const idx = Buffer.alloc(4);
  idx.writeUInt32LE(index, 0);
  return PublicKey.findProgramAddressSync(
    [DISPUTE_SEED, seller.toBuffer(), idx],
    PROGRAM_ID,
  )[0];
}

export type SellerAccount = {
  address: string;
  owner: string;
  arbiter: string;
  bondMint: string;
  handle: string;
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

/** Token account holding a seller's bond. Derived, so it needs no lookup table. */
export function vaultPda(seller: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, seller.toBuffer()],
    PROGRAM_ID,
  )[0];
}

export type DisputeStatus = "open" | "dismissed" | "slashed";

export type DisputeAccount = {
  address: string;
  seller: string;
  buyer: string;
  index: number;
  amount: bigint;
  openedAt: number;
  resolvedAt: number;
  status: DisputeStatus;
  evidenceHash: string;
};

/** Walks a buffer once, in declaration order, so drift is easy to spot. */
class Reader {
  private offset = 8; // Anchor's account discriminator

  constructor(private readonly buf: Buffer) {}

  pubkey(): string {
    const v = new PublicKey(this.buf.subarray(this.offset, this.offset + 32));
    this.offset += 32;
    return v.toBase58();
  }

  string(): string {
    const len = this.buf.readUInt32LE(this.offset);
    this.offset += 4;
    const v = this.buf.subarray(this.offset, this.offset + len).toString("utf8");
    this.offset += len;
    return v;
  }

  u64(): bigint {
    const v = this.buf.readBigUInt64LE(this.offset);
    this.offset += 8;
    return v;
  }

  i64(): number {
    const v = this.buf.readBigInt64LE(this.offset);
    this.offset += 8;
    return Number(v);
  }

  u32(): number {
    const v = this.buf.readUInt32LE(this.offset);
    this.offset += 4;
    return v;
  }

  u8(): number {
    const v = this.buf.readUInt8(this.offset);
    this.offset += 1;
    return v;
  }

  bytes(n: number): string {
    const v = this.buf.subarray(this.offset, this.offset + n).toString("hex");
    this.offset += n;
    return v;
  }
}

export function decodeSeller(address: PublicKey, data: Buffer): SellerAccount {
  const r = new Reader(data);
  return {
    address: address.toBase58(),
    owner: r.pubkey(),
    arbiter: r.pubkey(),
    bondMint: r.pubkey(),
    handle: r.string(),
    bond: r.u64(),
    lifetimeDeposited: r.u64(),
    slashedTotal: r.u64(),
    registeredAt: r.i64(),
    bondedSince: r.i64(),
    disputesOpened: r.u32(),
    disputesSlashed: r.u32(),
    disputesDismissed: r.u32(),
    openDisputes: r.u32(),
    withdrawUnlockAt: r.i64(),
  };
}

const STATUS: DisputeStatus[] = ["open", "dismissed", "slashed"];

export function decodeDispute(address: PublicKey, data: Buffer): DisputeAccount {
  const r = new Reader(data);
  const seller = r.pubkey();
  const buyer = r.pubkey();
  const index = r.u32();
  const amount = r.u64();
  const openedAt = r.i64();
  const resolvedAt = r.i64();
  const status = STATUS[r.u8()] ?? "open";
  const evidenceHash = r.bytes(32);
  return {
    address: address.toBase58(),
    seller,
    buyer,
    index,
    amount,
    openedAt,
    resolvedAt,
    status,
    evidenceHash,
  };
}

export async function fetchSeller(handle: string): Promise<SellerAccount | null> {
  const pda = sellerPda(handle);
  const info = await getConnection().getAccountInfo(pda);
  if (!info) return null;
  return decodeSeller(pda, info.data);
}

/**
 * Dispute indexes are handed out in order by the program, so the full history can
 * be addressed without an index server. One batched call covers every claim.
 */
export async function fetchDisputes(
  seller: SellerAccount,
): Promise<DisputeAccount[]> {
  if (seller.disputesOpened === 0) return [];

  const sellerKey = new PublicKey(seller.address);
  const pdas = Array.from({ length: seller.disputesOpened }, (_, i) =>
    disputePda(sellerKey, i),
  );

  const infos = await getConnection().getMultipleAccountsInfo(pdas);
  return infos
    .map((info, i) => (info ? decodeDispute(pdas[i], info.data) : null))
    .filter((d): d is DisputeAccount => d !== null)
    .sort((a, b) => b.openedAt - a.openedAt);
}

export function explorerAccount(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${CLUSTER}`;
}

export function explorerTx(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`;
}
