use anchor_lang::prelude::*;

use crate::constants::MAX_HANDLE_LEN;

/// One record per seller. The account itself holds the bonded lamports, so the
/// money and the reputation it backs can never drift apart.
#[account]
#[derive(InitSpace)]
pub struct Seller {
    /// Wallet allowed to top up or withdraw the bond.
    pub owner: Pubkey,
    /// Wallet allowed to rule on disputes.
    pub arbiter: Pubkey,
    /// Public handle, also the PDA seed and the slug in the profile URL.
    #[max_len(MAX_HANDLE_LEN)]
    pub handle: String,
    /// Lamports currently bonded and slashable.
    pub bond: u64,
    /// Everything ever put in, ignoring what came back out. Deters a seller who
    /// tops up right before a sale and pulls out right after.
    pub lifetime_deposited: u64,
    /// Everything ever paid out to wronged buyers.
    pub slashed_total: u64,
    /// When the seller first registered.
    pub registered_at: i64,
    /// When the bond last went from empty to funded. Resets on a full exit, so
    /// age cannot be recycled.
    pub bonded_since: i64,
    pub disputes_opened: u32,
    pub disputes_slashed: u32,
    pub disputes_dismissed: u32,
    pub open_disputes: u32,
    /// Unix time the announced withdrawal unlocks. Zero means no exit pending.
    pub withdraw_unlock_at: i64,
    pub bump: u8,
}

/// A single claim filed by a buyer. Kept as its own account so the history is
/// permanent and countable by anyone, not just by us.
#[account]
#[derive(InitSpace)]
pub struct Dispute {
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub index: u32,
    /// Lamports the buyer says they are owed.
    pub amount: u64,
    pub opened_at: i64,
    pub resolved_at: i64,
    /// 0 open, 1 dismissed, 2 slashed.
    pub status: u8,
    /// SHA-256 of the evidence bundle stored off chain. Lets a buyer prove later
    /// that the evidence was not swapped after the fact.
    pub evidence_hash: [u8; 32],
    pub bump: u8,
}
