use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BondmarkError;
use crate::state::{Dispute, Seller};

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    pub arbiter: Signer<'info>,

    #[account(
        mut,
        seeds = [SELLER_SEED, seller.handle.as_bytes()],
        bump = seller.bump,
        has_one = arbiter @ BondmarkError::NotArbiter
    )]
    pub seller: Account<'info, Seller>,

    #[account(
        mut,
        seeds = [DISPUTE_SEED, seller.key().as_ref(), &dispute.index.to_le_bytes()],
        bump = dispute.bump,
        constraint = dispute.seller == seller.key() @ BondmarkError::DisputeIndexMismatch
    )]
    pub dispute: Account<'info, Dispute>,

    /// CHECK: validated against the buyer recorded on the dispute account.
    #[account(mut, address = dispute.buyer)]
    pub buyer: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<ResolveDispute>, slash: bool) -> Result<()> {
    require!(
        ctx.accounts.dispute.status == DISPUTE_OPEN,
        BondmarkError::DisputeAlreadyResolved
    );

    let now = Clock::get()?.unix_timestamp;
    let claim = ctx.accounts.dispute.amount;

    if slash {
        let payout = claim.min(ctx.accounts.seller.bond);

        // The seller PDA is owned by this program, so its balance can be moved
        // without a CPI. Rent stays untouched because only `bond` is ever spent.
        let seller_ai = ctx.accounts.seller.to_account_info();
        **seller_ai.try_borrow_mut_lamports()? -= payout;
        **ctx.accounts.buyer.try_borrow_mut_lamports()? += payout;

        let seller = &mut ctx.accounts.seller;
        seller.bond = seller.bond.saturating_sub(payout);
        seller.slashed_total = seller
            .slashed_total
            .checked_add(payout)
            .ok_or(BondmarkError::MathOverflow)?;
        seller.disputes_slashed = seller
            .disputes_slashed
            .checked_add(1)
            .ok_or(BondmarkError::MathOverflow)?;

        // Draining the bond ends the clean streak. Age has to be earned again.
        if seller.bond == 0 {
            seller.bonded_since = 0;
        }

        ctx.accounts.dispute.status = DISPUTE_SLASHED;
        msg!("dispute #{} slashed {} lamports", ctx.accounts.dispute.index, payout);
    } else {
        let seller = &mut ctx.accounts.seller;
        seller.disputes_dismissed = seller
            .disputes_dismissed
            .checked_add(1)
            .ok_or(BondmarkError::MathOverflow)?;
        ctx.accounts.dispute.status = DISPUTE_DISMISSED;
        msg!("dispute #{} dismissed", ctx.accounts.dispute.index);
    }

    ctx.accounts.dispute.resolved_at = now;

    let seller = &mut ctx.accounts.seller;
    seller.open_disputes = seller.open_disputes.saturating_sub(1);

    Ok(())
}
