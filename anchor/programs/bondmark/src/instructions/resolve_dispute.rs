use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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

    #[account(
        mut,
        seeds = [VAULT_SEED, seller.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// Where a upheld claim gets paid. Checked against the buyer recorded on the
    /// dispute, so an arbiter cannot redirect the payout to themselves.
    #[account(
        mut,
        constraint = buyer_token.owner == dispute.buyer @ BondmarkError::WrongBuyerAccount,
        constraint = buyer_token.mint == seller.bond_mint @ BondmarkError::WrongBondMint
    )]
    pub buyer_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
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

        // The vault's authority is the seller record, so the program signs for
        // the payout and nobody with a keyboard can move it any other way.
        let handle = ctx.accounts.seller.handle.clone();
        let bump = ctx.accounts.seller.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[SELLER_SEED, handle.as_bytes(), &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.buyer_token.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
                signer_seeds,
            ),
            payout,
        )?;

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
        msg!("dispute #{} slashed {} base units", ctx.accounts.dispute.index, payout);
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
