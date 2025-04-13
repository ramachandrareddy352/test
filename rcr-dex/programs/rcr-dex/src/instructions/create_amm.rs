use crate::state::*;
use anchor_lang::prelude::*;

pub fn create_amm(ctx: Context<CreateAmm>) -> Result<()> {
    let amm = &mut ctx.accounts.amm;
    amm.pool_count = 0;
    amm.amm_bump = ctx.bumps.amm;
    Ok(())
}

#[derive(Accounts)]
pub struct CreateAmm<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Amm::INIT_SPACE,
        seeds = [b"amm"],
        bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
