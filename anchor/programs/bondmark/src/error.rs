use anchor_lang::prelude::*;

#[error_code]
pub enum BondmarkError {
    #[msg("Handle must be 1-32 characters, lowercase letters, digits, dot, underscore or hyphen")]
    InvalidHandle,
    #[msg("Deposit is below the minimum bond required for a badge")]
    BondTooSmall,
    #[msg("Deposit amount must be greater than zero")]
    ZeroAmount,
    #[msg("Only the account that registered this seller may do that")]
    NotSellerOwner,
    #[msg("Only the assigned arbiter may resolve a dispute")]
    NotArbiter,
    #[msg("Dispute index does not follow the seller's dispute counter")]
    DisputeIndexMismatch,
    #[msg("Claim exceeds the bond currently locked by this seller")]
    ClaimExceedsBond,
    #[msg("This dispute has already been resolved")]
    DisputeAlreadyResolved,
    #[msg("Seller has unresolved disputes; funds stay locked until they close")]
    OpenDisputesRemain,
    #[msg("Too many disputes are open against this seller")]
    TooManyOpenDisputes,
    #[msg("No withdrawal has been announced for this seller")]
    WithdrawNotRequested,
    #[msg("The seven day withdrawal notice has not elapsed yet")]
    WithdrawStillLocked,
    #[msg("Requested amount is larger than the remaining bond")]
    InsufficientBond,
    #[msg("A seller cannot file a dispute against their own bond")]
    SelfDispute,
    #[msg("Token account is not denominated in this seller's bond mint")]
    WrongBondMint,
    #[msg("Payout account does not belong to the buyer who filed the claim")]
    WrongBuyerAccount,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
