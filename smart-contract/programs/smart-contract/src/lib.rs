use anchor_lang::prelude::*;

declare_id!("5AfMkN6WiPsBKTdV2f38sJZarszPGMhCb3ooWnGhAYam");

#[program]
pub mod smart_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
