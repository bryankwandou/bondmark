use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BondmarkError;
use crate::state::Seller;

#[derive(Accounts)]
#[instruction(handle: String)]
pub struct RegisterSeller<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Seller::INIT_SPACE,
        seeds = [SELLER_SEED, handle.as_bytes()],
        bump
    )]
    pub seller: Account<'info, Seller>,

    pub system_program: Program<'info, System>,
}

/// Handles end up in URLs and in badge images, so they are restricted to
/// characters that survive both without escaping.
fn handle_is_clean(handle: &str) -> bool {
    if handle.is_empty() || handle.len() > MAX_HANDLE_LEN {
        return false;
    }
    handle
        .bytes()
        .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'.' || b == b'_' || b == b'-')
}

pub fn handler(ctx: Context<RegisterSeller>, handle: String, arbiter: Pubkey) -> Result<()> {
    require!(handle_is_clean(&handle), BondmarkError::InvalidHandle);

    let now = Clock::get()?.unix_timestamp;
    let seller = &mut ctx.accounts.seller;

    seller.owner = ctx.accounts.owner.key();
    seller.arbiter = arbiter;
    seller.handle = handle;
    seller.bond = 0;
    seller.lifetime_deposited = 0;
    seller.slashed_total = 0;
    seller.registered_at = now;
    seller.bonded_since = 0;
    seller.disputes_opened = 0;
    seller.disputes_slashed = 0;
    seller.disputes_dismissed = 0;
    seller.open_disputes = 0;
    seller.withdraw_unlock_at = 0;
    seller.bump = ctx.bumps.seller;

    msg!("seller registered: {}", seller.handle);
    Ok(())
}
