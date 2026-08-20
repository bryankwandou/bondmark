use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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

    #[account(
        mut,
        constraint = owner_token.mint == seller.bond_mint @ BondmarkError::WrongBondMint,
        constraint = owner_token.owner == owner.key() @ BondmarkError::NotSellerOwner
    )]
    pub owner_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [VAULT_SEED, seller.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DepositBond>, amount: u64) -> Result<()> {
    require!(amount > 0, BondmarkError::ZeroAmount);

    let now = Clock::get()?.unix_timestamp;
    let starting_from_empty = ctx.accounts.seller.bond == 0;

    // A first deposit has to clear the floor, otherwise the badge would promise
    // more than the money behind it.
    if starting_from_empty {
        require!(amount >= MIN_BOND_UNITS, BondmarkError::BondTooSmall);
    }

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.owner_token.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
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

    msg!("bond now {} base units", seller.bond);
    Ok(())
}
