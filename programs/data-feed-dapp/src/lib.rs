use anchor_lang::prelude::*;
use chainlink_solana as chainlink;
use anchor_lang::solana_program::system_program;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("BNK1JjB9vENSrinH4RJbSnLCJQrS9h1Mf21A4VjUh2a7");

#[program]
pub mod data_feed_dapp {
    use super::*;

    pub fn execute(ctx: Context<Execute>) -> ProgramResult{
        let round = chainlink::latest_round_data(
            ctx.accounts.chainlink_program.to_account_info(),
            ctx.accounts.chainlink_feed.to_account_info()
        )?;
        let decimals = chainlink::decimals(
            ctx.accounts.chainlink_program.to_account_info(),
            ctx.accounts.chainlink_feed.to_account_info(),
        )?;
        let result_account = &mut ctx.accounts.result_account;
        result_account.value = round.answer;
        result_account.decimal = u32::from(decimals);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info>{
    #[account(init, payer=user, space =100)]
    pub result_account: Account<'info, ResultAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK:
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
    /// CHECK:
    pub chainlink_program: AccountInfo<'info>,
    /// CHECK:
    pub chainlink_feed: AccountInfo<'info>
}

#[account]
pub struct ResultAccount{
    pub value:i128,
    pub decimal:u32
}

