use anchor_lang::prelude::*;

#[constant]
pub const MINIMUM_LIQUIDITY: u64 = 100; // any user have to deposit minimum of 100 liquidity
pub const PRECISION: u64 = 10000;
pub const SWAP_FEE_1: u64 = 10; // 0.1%
pub const SWAP_FEE_2: u64 = 30; // 0.3%
pub const SWAP_FEE_3: u64 = 100; // 1%
