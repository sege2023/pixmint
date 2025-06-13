use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount},
}
use mpl_token_metadata::{
    instructuion::{create_metadata_accounts_v3,create_master_edition_v3, CreateMetadataAccountsV3, CreateMasterEditonV3},
    state::{Collection, Creator, Datav2, Uses}
    ID as METAPLEX_ID,
}

declare_id!("5AfMkN6WiPsBKTdV2f38sJZarszPGMhCb3ooWnGhAYam");

#[program]
pub mod smart_contract {
    use super::*;

    // pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    //     msg!("Greetings from: {:?}", ctx.program_id);
    //     Ok(())
    // }

    pub fn mintnft(ctx: Context<MintNft>, nft_name: String, symbol:String nft_uri: String) -> Result<()>{
        let rent_exempt_lamports = Rent::get()?.minimum_balance(Mint::LEN)
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeMint {
                    mint: ctx.accounts.mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            0,
            &ctx.accounts.payer.key(), 
            Some(&ctx.accounts.payer.key()), 
        )?;
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            1, 
        )
        // custome fee for minting NFT
        let ix = system_program::transfer(
            &ctx.accounts.user.to_account_info(),
            &ctx.accounts.fee_receiver.to_account_info(),
            1_000_000 // 0.001 SOL
        );
        invoke(&ix, &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.fee_receiver.to_account_info(),
        ])?;
        let (metadata_pda, bump) = PubKey::find_program_address(
            &[
                mpl_token_metadata::ID.as_ref(),
                ctx.accounts.mint.key().as_ref(),
                "metadata.as_bytes()",
            ],
            &mpl_token_metadata::ID,
        )
        require_eq!(metadata_pda, ctx.accounts.metadata_account.key(), MyError::InvalidMetadataAccount);

        let creators = Some(vec![creator{
                address: ctx.accounts.signer.key(),
                verified: false,
                share: 100,
        }]);
        let collection: option<Collection> = None;
        let uses: Option<Uses> = None;

        let instruction = create_metadata_accounts_v3(
            mpl_token_metadata::ID,
            metadata_pda,
            ctx.accounts.mint.key(),
            ctx.accounts.signer.key(),
            ctx.accounts.signer.key(),
            ctx.accounts.signer.key(),
            nft_name,
            symbol,
            nft_uri,
            creators,
            100
            true,
            collection, 
            uses,
            None, 
        );
        anchor_lang::solana_program::program::invoke(
            &create_metadata_ix,
            &[
                ctx.accounts.metadata_account.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &[]
        )?;


        let (master_edition_pda, _edition_bump) = Pubkey::find_program_address(
            &[
                METAPLEX_ID.as_ref(),
                ctx.accounts.mint.key().as_ref(),
                "edition".as_bytes(),
            ],
            &METAPLEX_ID,
        );

        require_eq!(master_edition_pda, ctx.accounts.master_edition_account.key(), MyError::InvalidMasterEditionAccount);
        let create_master_edition_ix = create_master_edition_v3(
            METAPLEX_ID,
            master_edition_pda, // Master Edition account PDA
            ctx.accounts.mint.key(), // Mint account
            ctx.accounts.signer.key(), // Update authority
            ctx.accounts.signer.key(), // Mint authority
            ctx.accounts.metadata_account.key(), // Metadata account
            ctx.accounts.signer.key(), // Payer for the Master Edition account
            Some(0), // max_supply: 0 for 1/1 NFTs, meaning no more can be minted from this master.
        );
        anchor_lang::solana_program::program::invoke(
            &create_master_edition_ix,
            &[
                ctx.accounts.master_edition_account.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.metadata_account.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &[]
        )?;

        msg!("NFT Sucessfully Minted!");
        msg!("NFT Name: {}", nft_name);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("Invalid Metadata Account PDA")]
    InvalidMetadataAccount,
}

#[derive(Accounts)]
// pub struct Initialize {}
pub struct MintNft<'info> {
    #[account(
        init,
        payer = signer,
        mint::decimals = 0
        mint::authority = signer,
        mint::freeze_authority = signer,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub token_account: Account<'info, token::TokenAccount>,

    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub master_edition_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub fee_receiver: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_proram: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[error_code]
#[derive(Clone, Copy)] 
pub enum MyError {
    #[msg("Invalid Metadata Account PDA")]
    InvalidMetadataAccount,
    #[msg("Invalid Master Edition Account PDA")]
    InvalidMasterEditionAccount, // Add this
}

#[derive(Clone)]
pub struct Metadata;

impl anchor_lang::Id for Metadata {
    fn id() -> Pubkey {
        METAPLEX_ID
    }
}

// #[account]
// pub struct NftData{
     
// }

