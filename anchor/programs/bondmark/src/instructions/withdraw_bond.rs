use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::BondmarkError;
use crate::state::Seller;

#[derive(Accounts)]
pub struct WithdrawBond<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [SELLER_SEED, seller.handle.as_bytes()],
        bump = seller.bump,
        has_one = owner @ BondmarkError::NotSellerOwner
    )]
    pub seller: Account<'info, Seller>,
}

pub fn handler(ctx: Context<WithdrawBond>, amount: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    {
        let seller = &ctx.accounts.seller;
        require!(amount > 0, BondmarkError::ZeroAmount);
        require!(seller.withdraw_unlock_at != 0, BondmarkError::WithdrawNotRequested);
        require!(now >= seller.withdraw_unlock_at, BondmarkError::WithdrawStillLocked);
        require!(seller.open_disputes == 0, BondmarkError::OpenDisputesRemain);
        require!(amount <= seller.bond, BondmarkError::InsufficientBond);
    }

    let seller_ai = ctx.accounts.seller.to_account_info();
    **seller_ai.try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;

    let seller = &mut ctx.accounts.seller;
    seller.bond = seller.bond.saturating_sub(amount);

    if seller.bond == 0 {
        seller.bonded_since = 0;
        seller.withdraw_unlock_at = 0;
    }

    msg!("withdrew {} lamports, {} remaining", amount, seller.bond);
    Ok(())
}
