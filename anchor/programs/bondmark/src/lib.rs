pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5qbPy6p44mp8r73vNwmzMmzzSwGMm9veiwrSDgnyPctG");

/// Bondmark keeps a seller's own money on the line behind their storefront.
/// Everything a buyer needs in order to judge a seller lives in these accounts,
/// so the badge can be checked without trusting the company that issued it.
#[program]
pub mod bondmark {
    use super::*;

    /// Claim a handle and open an empty record. Costs rent only.
    pub fn register_seller(
        ctx: Context<RegisterSeller>,
        handle: String,
        arbiter: Pubkey,
    ) -> Result<()> {
        register_seller::handler(ctx, handle, arbiter)
    }

    /// Move lamports into the record. This is what the badge actually shows.
    pub fn deposit_bond(ctx: Context<DepositBond>, amount: u64) -> Result<()> {
        deposit_bond::handler(ctx, amount)
    }

    /// File a claim. Anyone but the seller may do this; the deposit stays put
    /// until the claim is ruled on.
    pub fn open_dispute(
        ctx: Context<OpenDispute>,
        index: u32,
        amount: u64,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        open_dispute::handler(ctx, index, amount, evidence_hash)
    }

    /// Rule on a claim: either pay the buyer out of the bond, or dismiss it.
    pub fn resolve_dispute(ctx: Context<ResolveDispute>, slash: bool) -> Result<()> {
        resolve_dispute::handler(ctx, slash)
    }

    /// Announce an exit and start the seven day notice period.
    pub fn request_withdraw(ctx: Context<RequestWithdraw>) -> Result<()> {
        request_withdraw::handler(ctx)
    }

    /// Take the bond back once the notice period has run and nothing is pending.
    pub fn withdraw_bond(ctx: Context<WithdrawBond>, amount: u64) -> Result<()> {
        withdraw_bond::handler(ctx, amount)
    }
}
