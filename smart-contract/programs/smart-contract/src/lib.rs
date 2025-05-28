use anchor_lang::prelude::*;

declare_id!("5AfMkN6WiPsBKTdV2f38sJZarszPGMhCb3ooWnGhAYam");

#[program]
pub mod smart_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn mintnft(ctx: Context<MintNft) -> Result<()>{

    }
}

#[derive(Accounts)]
pub struct Initialize {}
pub struct MintNft<'info> {
    #[account(inti)]
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NftData{
     
}
