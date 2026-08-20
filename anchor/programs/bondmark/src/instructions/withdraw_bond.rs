use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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

    #[account(
        mut,
        seeds = [VAULT_SEED, seller.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token.mint == seller.bond_mint @ BondmarkError::WrongBondMint,
        constraint = owner_token.owner == owner.key() @ BondmarkError::NotSellerOwner
    )]
    pub owner_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
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

    let handle = ctx.accounts.seller.handle.clone();
    let bump = ctx.accounts.seller.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[SELLER_SEED, handle.as_bytes(), &[bump]]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.owner_token.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    let seller = &mut ctx.accounts.seller;
    seller.bond = seller.bond.saturating_sub(amount);

    if seller.bond == 0 {
        seller.bonded_since = 0;
        seller.withdraw_unlock_at = 0;
    }

    msg!("withdrew {} base units, {} remaining", amount, seller.bond);
    Ok(())
}
