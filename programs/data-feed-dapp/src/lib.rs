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

    pub fn create(ctx: Context<Create>) -> ProgramResult{
        let base_account = &mut ctx.accounts.base_account;
        base_account.admin = *ctx.accounts.user.key;
        base_account.amount = 0;
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult{
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.base_account.key(),
            amount
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.base_account.to_account_info()
            ]
        );

        (&mut ctx.accounts.base_account).amount += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info>{
    #[account(init, payer=base_account, space =100)]
    pub result_account: Account<'info, ResultAccount>,
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    /// CHECK:
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
    /// CHECK:
    pub chainlink_program: AccountInfo<'info>,
    /// CHECK:
    pub chainlink_feed: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct Create<'info>{
    #[account(init, payer = user, space = 200, seeds = ["BASE_DEMO".as_ref(), user.key().as_ref()],bump)]
    pub base_account: Account<'info,BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK:
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct Donate<'info>{
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK:
    pub system_program: Program<'info, System>
}

#[account]
pub struct ResultAccount{
    pub value:i128,
    pub decimal:u32
}

#[account]
pub struct BaseAccount{
    pub admin: Pubkey,
    pub amount: u64
}

