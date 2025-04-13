use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;

// #[access_control(check(&ctx))]
pub fn change_amm_admin(ctx: Context<ChangeAmmAdmin>) -> Result<()> {
    let amm = &mut ctx.accounts.amm;
    amm.admin = ctx.accounts.new_admin.key();
    Ok(())
}

// fn check(ctx: &Context<ChangeAmmAdmin>) -> Result<()> {
//     // Check if signer === owner
//     require_keys_eq!(
//         ctx.accounts.old_admin.key(),
//         ctx.accounts.amm.admin,
//         Errors::InvalidAdmin
//     );

//     Ok(())
// }

#[derive(Accounts)]
pub struct ChangeAmmAdmin<'info> {
    #[account(
        mut,
        seeds = [b"amm"],
        bump = amm.amm_bump,
        // has_one = old_admin,  // this is enough for checking admin
        constraint = old_admin.key() == amm.admin @ Errors::InvalidAdmin,  // it is also used to check owner
    )]
    pub amm: Box<Account<'info, Amm>>,

    /// CHECK: Admin is authorized via program checks, not through account constraints.
    pub new_admin: AccountInfo<'info>,

    #[account(mut)]
    pub old_admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}
