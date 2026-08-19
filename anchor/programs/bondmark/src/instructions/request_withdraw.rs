use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BondmarkError;
use crate::state::Seller;

#[derive(Accounts)]
pub struct RequestWithdraw<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [SELLER_SEED, seller.handle.as_bytes()],
        bump = seller.bump,
        has_one = owner @ BondmarkError::NotSellerOwner
    )]
    pub seller: Account<'info, Seller>,
}

pub fn handler(ctx: Context<RequestWithdraw>) -> Result<()> {
    let seller = &mut ctx.accounts.seller;

    require!(seller.bond > 0, BondmarkError::InsufficientBond);
    require!(seller.open_disputes == 0, BondmarkError::OpenDisputesRemain);

    let now = Clock::get()?.unix_timestamp;
    seller.withdraw_unlock_at = now
        .checked_add(WITHDRAW_COOLDOWN_SECS)
        .ok_or(BondmarkError::MathOverflow)?;

    // The profile page reads this field and turns the badge amber, so buyers see
    // the exit forming instead of discovering it after the fact.
    msg!("withdrawal announced, unlocks at {}", seller.withdraw_unlock_at);
    Ok(())
}
