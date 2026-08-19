// Anchor's #[program] macro expects the generated client-account modules to be in
// scope, so each instruction module is glob re-exported. Every module also defines
// its own `handler`, which the compiler flags as an ambiguous re-export; lib.rs
// always calls them by full path, so the ambiguity never resolves to the wrong one.
#![allow(ambiguous_glob_reexports)]

pub mod deposit_bond;
pub mod open_dispute;
pub mod register_seller;
pub mod request_withdraw;
pub mod resolve_dispute;
pub mod withdraw_bond;

pub use deposit_bond::*;
pub use open_dispute::*;
pub use register_seller::*;
pub use request_withdraw::*;
pub use resolve_dispute::*;
pub use withdraw_bond::*;
