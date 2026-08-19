use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::error::BondmarkError;
use crate::state::Seller;

#[derive(Accounts)]
pub struct DepositBond<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [SELLER_SEED, seller.handle.as_bytes()],
        bump = seller.bump,
        has_one = owner @ BondmarkError::NotSellerOwner
    )]
    pub seller: Account<'info, Seller>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositBond>, amount: u64) -> Result<()> {
    require!(amount > 0, BondmarkError::ZeroAmount);

    let now = Clock::get()?.unix_timestamp;
    let starting_from_empty = ctx.accounts.seller.bond == 0;

    // A first deposit has to clear the floor, otherwise the badge would promise
    // more than the money behind it.
    if starting_from_empty {
        require!(amount >= MIN_BOND_LAMPORTS, BondmarkError::BondTooSmall);
    }

    // The seller PDA holds the lamports directly, so a slash later is a plain
    // balance move rather than a second account to keep in sync.
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.key(),
            Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.seller.to_account_info(),
            },
        ),
        amount,
    )?;

    let seller = &mut ctx.accounts.seller;
    seller.bond = seller.bond.checked_add(amount).ok_or(BondmarkError::MathOverflow)?;
    seller.lifetime_deposited = seller
        .lifetime_deposited
        .checked_add(amount)
        .ok_or(BondmarkError::MathOverflow)?;

    if starting_from_empty {
        seller.bonded_since = now;
    }

    // Topping up is treated as calling off the exit. A seller cannot keep a
    // countdown running quietly while still showing a funded badge.
    seller.withdraw_unlock_at = 0;

    msg!("bond now {} lamports", seller.bond);
    Ok(())
}
