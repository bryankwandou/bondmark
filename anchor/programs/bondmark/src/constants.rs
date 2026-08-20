
/// PDA namespace for a seller record. Combined with the handle it also acts as
/// the uniqueness guarantee: two sellers can never claim the same handle.

pub const SELLER_SEED: &[u8] = b"seller";

/// PDA namespace for the token account that actually holds a seller's bond.
/// Derived from the seller record, so a buyer can find the money from the handle
/// alone without asking us where it lives.
pub const VAULT_SEED: &[u8] = b"vault";

/// PDA namespace for a single dispute filed against a seller.

pub const DISPUTE_SEED: &[u8] = b"dispute";

/// Handles are what buyers type and what appears in the public URL, so they are
/// kept short enough to stay readable and cheap to store.
pub const MAX_HANDLE_LEN: usize = 32;

/// Smallest deposit that earns a badge, in the bond mint's base units. USDC has
/// six decimals, so this is 25 USDC — roughly one small order in the market this
/// is built for. Below it the guarantee is theatre.
pub const MIN_BOND_UNITS: u64 = 25_000_000;

/// A seller who wants their money back has to announce it and wait. The delay is
/// the whole point: it gives anyone who was wronged a window to file first.
pub const WITHDRAW_COOLDOWN_SECS: i64 = 7 * 24 * 60 * 60;

/// Upper bound on concurrent disputes, so a coordinated flood cannot freeze a
/// seller's funds indefinitely.
pub const MAX_OPEN_DISPUTES: u32 = 25;

pub const DISPUTE_OPEN: u8 = 0;
pub const DISPUTE_DISMISSED: u8 = 1;
pub const DISPUTE_SLASHED: u8 = 2;
