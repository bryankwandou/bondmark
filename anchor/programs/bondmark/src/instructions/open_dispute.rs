use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BondmarkError;
use crate::state::{Dispute, Seller};

#[derive(Accounts)]
#[instruction(index: u32)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [SELLER_SEED, seller.handle.as_bytes()],
        bump = seller.bump
    )]
    pub seller: Account<'info, Seller>,

    #[account(
        init,
        payer = buyer,
        space = 8 + Dispute::INIT_SPACE,
        seeds = [DISPUTE_SEED, seller.key().as_ref(), &index.to_le_bytes()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<OpenDispute>,
    index: u32,
    amount: u64,
    evidence_hash: [u8; 32],
) -> Result<()> {
    let seller = &ctx.accounts.seller;

    require_keys_neq!(
        ctx.accounts.buyer.key(),
        seller.owner,
        BondmarkError::SelfDispute
    );
    // Indexes are handed out in order, which makes the dispute list walkable by
    // anyone without needing our database.
    require!(
        index == seller.disputes_opened,
        BondmarkError::DisputeIndexMismatch
    );
    require!(amount > 0, BondmarkError::ZeroAmount);
    require!(amount <= seller.bond, BondmarkError::ClaimExceedsBond);
    require!(
        seller.open_disputes < MAX_OPEN_DISPUTES,
        BondmarkError::TooManyOpenDisputes
    );

    let now = Clock::get()?.unix_timestamp;
    let seller_key = seller.key();

    let dispute = &mut ctx.accounts.dispute;
    dispute.seller = seller_key;
    dispute.buyer = ctx.accounts.buyer.key();
    dispute.index = index;
    dispute.amount = amount;
    dispute.opened_at = now;
    dispute.resolved_at = 0;
    dispute.status = DISPUTE_OPEN;
    dispute.evidence_hash = evidence_hash;
    dispute.bump = ctx.bumps.dispute;

    let seller = &mut ctx.accounts.seller;
    seller.disputes_opened = seller
        .disputes_opened
        .checked_add(1)
        .ok_or(BondmarkError::MathOverflow)?;
    seller.open_disputes = seller
        .open_disputes
        .checked_add(1)
        .ok_or(BondmarkError::MathOverflow)?;

    msg!("dispute #{} opened for {} lamports", index, amount);
    Ok(())
}
