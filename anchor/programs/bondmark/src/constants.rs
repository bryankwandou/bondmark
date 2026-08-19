
/// PDA namespace for a seller record. Combined with the handle it also acts as
/// the uniqueness guarantee: two sellers can never claim the same handle.

pub const SELLER_SEED: &[u8] = b"seller";

/// PDA namespace for a single dispute filed against a seller.

pub const DISPUTE_SEED: &[u8] = b"dispute";

/// Handles are what buyers type and what appears in the public URL, so they are
/// kept short enough to stay readable and cheap to store.
pub const MAX_HANDLE_LEN: usize = 32;

/// Smallest deposit that earns a badge. Below this the guarantee is theatre.
pub const MIN_BOND_LAMPORTS: u64 = 100_000_000; // 0.1 SOL

/// A seller who wants their money back has to announce it and wait. The delay is
/// the whole point: it gives anyone who was wronged a window to file first.
pub const WITHDRAW_COOLDOWN_SECS: i64 = 7 * 24 * 60 * 60;

/// Upper bound on concurrent disputes, so a coordinated flood cannot freeze a
/// seller's funds indefinitely.
pub const MAX_OPEN_DISPUTES: u32 = 25;

pub const DISPUTE_OPEN: u8 = 0;
pub const DISPUTE_DISMISSED: u8 = 1;
pub const DISPUTE_SLASHED: u8 = 2;
