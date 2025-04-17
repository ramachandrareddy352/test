pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use {anchor_lang::prelude::*, instructions::*};

// Set the correct key here
declare_id!("FAoQiEDBmQW7aPNwcsdp988aoDNSwSbxfxSMKxaqSEhY");

#[program]
pub mod rcr_dex {
    use super::*;

    pub fn create_amm(ctx: Context<CreateAmm>) -> Result<()> {
        msg!("Creating AMM ...");
        create_amm::create_amm(ctx)
    }

    pub fn create_pool(ctx: Context<CreatePool>, fees: u64) -> Result<()> {
        msg!("Creating a new pool ...");
        create_pool::create_pool(ctx, fees)
    }

    pub fn deposit_liquidity(
        ctx: Context<DepositLiquidity>,
        fees: u64,
        amount_a: u64,
        amount_b: u64,
        min_liquidity: u64,
    ) -> Result<()> {
        msg!("Depositing liquidity ...");
        deposit_liquidity::deposit_liquidity(ctx, fees, amount_a, amount_b, min_liquidity)
    }

    pub fn withdraw_liquidity(
        ctx: Context<WithdrawLiquidity>,
        fees: u64,
        liquidity_amount: u64,
        min_amount_a: u64,
        min_amount_b: u64,
    ) -> Result<()> {
        msg!("Withdrawing liquidity ...");
        withdraw_liquidity::withdraw_liquidity(
            ctx,
            fees,
            liquidity_amount,
            min_amount_a,
            min_amount_b,
        )
    }

    pub fn swap_exact_input(
        ctx: Context<SwapExactInput>,
        fees: u64,
        swap_a: bool, // output should be mint_a
        input_amount: u64,
        min_output_amount: u64,
        delta_price_change: u64,
    ) -> Result<()> {
        msg!("Swaping token with exact input tokens ...");
        swap_exact_input::swap_exact_input(
            ctx,
            fees,
            swap_a,
            input_amount,
            min_output_amount,
            delta_price_change,
        )
    }

    pub fn swap_exact_output(
        ctx: Context<SwapExactOutput>,
        fees: u64,
        swap_a: bool,
        output_amount: u64,
        max_input_amount: u64,
        delta_price_change: u64,
    ) -> Result<()> {
        msg!("Swaping token with exact output tokens ...");
        swap_exact_output::swap_exact_output(
            ctx,
            fees,
            swap_a,
            output_amount,
            max_input_amount,
            delta_price_change,
        )
    }
}
