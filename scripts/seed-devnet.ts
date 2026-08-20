/**
 * Puts one real seller on devnet so the public pages have something honest to
 * render. Everything this writes is a genuine transaction against the deployed
 * program — no fixtures, no mock data behind the profile.
 *
 *   npx tsx scripts/seed-devnet.ts <path-to-payer-keypair.json>
 */

import { readFileSync } from "node:fs";

import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";

import idl from "../src/lib/solana/idl.json";

const RPC = "https://api.devnet.solana.com";
const HANDLE = "warung.mirna";

/** Six-decimal test stablecoin standing in for USDC, which devnet cannot mint. */
const BOND_MINT = new PublicKey("3q7LeeY51YvVHRC5MFJVSPpPx8pJ8ZFq31vbjzriRMrk");
const UNITS_PER_USD = 1_000_000;
const DEPOSIT_USD = 250;

function loadKeypair(path: string): Keypair {
  const raw = JSON.parse(readFileSync(path, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const keypairPath = process.argv[2];
  if (!keypairPath) {
    throw new Error("Pass the payer keypair path as the first argument.");
  }

  const payer = loadKeypair(keypairPath);
  const connection = new anchor.web3.Connection(RPC, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);
  const programId = program.programId;

  const [sellerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("seller"), Buffer.from(HANDLE)],
    programId,
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), sellerPda.toBuffer()],
    programId,
  );
  const ownerToken = getAssociatedTokenAddressSync(BOND_MINT, payer.publicKey);

  console.log("program", programId.toBase58());
  console.log("payer  ", payer.publicKey.toBase58());
  console.log("seller ", sellerPda.toBase58());
  console.log("vault  ", vaultPda.toBase58());

  const existing = await connection.getAccountInfo(sellerPda);

  if (!existing) {
    const sig = await program.methods
      .registerSeller(HANDLE, payer.publicKey)
      .accounts({
        owner: payer.publicKey,
        bondMint: BOND_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("registered:", sig);
  } else {
    console.log("seller already registered, skipping");
  }

  // $250 is deliberately a figure a real small seller could reach, not a number
  // chosen to make the demo score well.
  const depositSig = await program.methods
    .depositBond(new anchor.BN(DEPOSIT_USD * UNITS_PER_USD))
    .accounts({
      owner: payer.publicKey,
      seller: sellerPda,
      ownerToken,
      vault: vaultPda,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  console.log("deposited:", depositSig);

  const account = await program.account.seller.fetch(sellerPda);
  console.log("bond now: $", Number(account.bond) / UNITS_PER_USD);
  console.log(
    `profile: https://explorer.solana.com/address/${sellerPda.toBase58()}?cluster=devnet`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
