"use client";

import React from "react";
import { Typography, Divider, Collapse } from "antd";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function HomePage() {
  return (
    <div
      style={{
        margin: "2rem",
        padding: "1rem",
        color: "pink",
        backgroundColor: "white",
      }}
    >
      <Typography style={{ color: "white" }}>
        {/* Title Page */}
        <Title level={2} style={{ textAlign: "center" }}>
          Decentralized Exchange (DEX) Documentation
        </Title>

        {/* Abstract */}
        <Title level={3}>Abstract</Title>
        <Paragraph>
          This document describes our decentralized exchange (DEX) protocol
          built on Solana devnet using the Anchor framework for on-chain
          programs and React for the front-end. Our design leverages an
          Automated Market Maker (AMM) model where the pool invariant is
          maintained as<Text code> x · y = k</Text>. The core features include
          viewing pools, creating liquidity pools, adding liquidity, removing
          liquidity, and performing token swaps with precise input/output
          calculations and rigorous security measures.
          <br />
          In addition to these functionalities, our system integrates Solana Pay
          to enable seamless and secure on-chain payments. Solana Pay allows
          users to initiate transactions through QR codes or clickable links
          that pre-fill payment details—including recipient address, amount, and
          a unique transaction reference—thus eliminating intermediaries and
          reducing fees. By combining our AMM-based DEX with Solana Pay, our
          protocol not only supports efficient token trading but also provides a
          robust payment layer suitable for real-world commerce, digital goods,
          and service-based platforms.
        </Paragraph>

        <Divider style={{ borderColor: "gray" }} />

        {/* Introduction */}
        <Title level={3}>Introduction</Title>
        <Paragraph>
          Decentralized exchanges (DEXs) enable trustless token trading without
          relying on centralized intermediaries. This project implements an
          AMM-based DEX on Solana, where each pool is formed by two unique
          tokens under a specific fee tier. No initial liquidity is necessary to
          create a pool; instead, traders pay a fee to initialize it. Subsequent
          liquidity additions, removals, and swaps maintain the constant product
          invariant.
        </Paragraph>

        <Divider style={{ borderColor: "gray" }} />

        {/* Protocol Overview */}
        <Title level={3}>Protocol Overview</Title>
        <Paragraph>The protocol is divided into five main modules:</Paragraph>
        <ol style={{ color: "black" }}>
          <li>
            <Text strong>View Pools:</Text> Displays current trading pools
            (showing Mint-A/Mint-B addresses, fees, liquidity, and total
            deposits).
          </li>
          <li>
            <Text strong>Create Pools:</Text> Allows traders to create pools
            with two unique tokens (Mint-A must be greater than Mint-B) and
            includes a fee payment to the pool admin.
          </li>
          <li>
            <Text strong>Add Liquidity:</Text> Lets liquidity providers deposit
            tokens into a pool. Deposits can be in unequal ratios—in which case
            the protocol swaps the excess via an external DEX (e.g., Raydium) to
            maintain balance.
          </li>
          <li>
            <Text strong>Remove Liquidity:</Text> Liquidity providers burn their
            liquidity tokens (shares) to reclaim underlying tokens and receive
            swap fees accrued.
          </li>
          <li>
            <Text strong>Swap Tokens:</Text> Users can swap tokens via exact
            input or exact output methods. The protocol calculates fees,
            enforces slippage tolerance, and adjusts amounts accordingly.
          </li>
        </ol>

        <Divider style={{ borderColor: "gray" }} />

        <Typography style={{ color: "white" }}>
          <Title level={3}>
            Using Solana Pay for Seamless Blockchain Transactions
          </Title>
          <Paragraph>
            In our project, we integrated <Text strong>Solana Pay</Text> to
            handle digital payments directly on the Solana blockchain. Solana
            Pay is a decentralized, open-source protocol designed for instant,
            fee-efficient transactions. By using this protocol, we eliminate the
            need for intermediaries such as traditional payment gateways.
          </Paragraph>
          <Paragraph>
            When a user initiates a transaction (e.g., purchasing a service or
            donating funds), our frontend generates a Solana Pay URL containing:
          </Paragraph>
          <ul>
            <li>
              <Text strong>The recipient’s wallet address</Text>
            </li>
            <li>
              <Text strong>The exact amount to be paid</Text>
            </li>
            <li>
              <Text strong>A unique reference for the transaction</Text>
            </li>
            <li>
              <Text strong>Optional metadata</Text> such as labels or memos
            </li>
          </ul>
          <Paragraph>
            This URL is then presented to the user as a QR code or as a
            clickable link. The user can scan it using their Phantom or Solflare
            wallet, which opens a pre-filled transaction that they can confirm.
            Once confirmed, the transaction is executed directly on-chain.
          </Paragraph>
          <Paragraph>
            We also use the reference key mechanism to track transactions and
            confirm payment success using a backend cron job or webhook that
            listens for matching transactions on-chain.
          </Paragraph>
          <Paragraph>This approach provides:</Paragraph>
          <ul>
            <li>
              <Text strong>🔐 Secure, trustless payments</Text>
            </li>
            <li>
              <Text strong>⚡️ Instant settlement</Text>
            </li>
            <li>
              <Text strong>🧾 Easy tracking of payment status</Text>
            </li>
            <li>
              <Text strong>
                💸 Minimal transaction fees (fractions of a cent)
              </Text>
            </li>
          </ul>
          <Paragraph>
            By using Solana Pay, we provide a robust payment layer for our
            decentralized application, making it suitable for real-world
            commerce, digital goods, and service-based platforms.
          </Paragraph>
        </Typography>

        <Divider style={{ borderColor: "gray" }} />

        {/* Detailed Functional Descriptions */}
        <Title level={3}>Detailed Functional Descriptions</Title>
        <Collapse bordered style={{ backgroundColor: "black", color: "white" }}>
          {/* View Pools Section */}
          <Panel header="1) View Pools" key="1" style={{ color: "white" }}>
            <Paragraph>
              <Text strong>Functionality:</Text> The UI displays all active
              pools including the token mint addresses (Mint-A and Mint-B), fee
              tier, current pool liquidity, and the total amount deposited in
              the pool. Data is fetched by querying the pool accounts from the
              blockchain.
            </Paragraph>
          </Panel>

          {/* Create Pools Section */}
          <Panel header="2) Create Pools" key="2" style={{ color: "white" }}>
            <Paragraph>
              <Text strong>Create Pools</Text> lets traders create a pool with
              two unique tokens under a specified fee tier. The following rules
              apply:
            </Paragraph>
            <ul>
              <li>
                Mint-A address must be greater than Mint-B address to enforce
                ordering.
              </li>
              <li>
                Only one pool can exist for any unique token pair regardless of
                fee tiers.
              </li>
              <li>
                The pool adheres to the AMM principle (
                <Text code>x * y = k</Text>).
              </li>
            </ul>
            <Paragraph>
              <Text strong>Example Calculation:</Text>
            </Paragraph>
            <Paragraph>
              If a fee tier of <Text code>30</Text> (i.e., 0.3%) is used, the
              pools PDA is derived using seeds including the fee value, the AMM
              address, and the token mint addresses. This ensures that the same
              pool cannot be recreated with duplicate parameters.
            </Paragraph>
            <Paragraph>
              <Text strong>On-chain Snippet:</Text>
            </Paragraph>
            <pre
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "1rem",
              }}
            >
              {`use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

pub fn create_pool(ctx: Context<CreatePool>, fees: u64) -> Result<()> {
    // pool should have to select any one of the fee tier only
    require!(
        fees == SWAP_FEE_1 || fees == SWAP_FEE_2 || fees == SWAP_FEE_3,
        Errors::InvalidFee
    );
    require!(
        ctx.accounts.mint_a.key() > ctx.accounts.mint_b.key(),
        Errors::InTokensOrder
    );
    require!(
        ctx.accounts.payer.to_account_info().lamports() > POOL_CREATION_FEE,
        Errors::InsufficientBalance
    );

    // transfer 0.1 SOL to create a pool
    transfer_sol(
        &ctx.accounts.payer,
        &ctx.accounts.admin,
        &ctx.accounts.system_program,
        POOL_CREATION_FEE,
    )?;

    // update the data to pool account
    let pool = &mut ctx.accounts.pool;
    pool.amm = ctx.accounts.amm.key();
    pool.mint_a = ctx.accounts.mint_a.key();
    pool.mint_b = ctx.accounts.mint_b.key();
    pool.fees = fees;
    pool.mint_liquidity = ctx.accounts.mint_liquidity.key();
    pool.pool_account_a = ctx.accounts.pool_account_a.key();
    pool.pool_account_b = ctx.accounts.pool_account_b.key();
    pool.pool_bump = ctx.bumps.pool;
    pool.pool_mint_liquidity_bump = ctx.bumps.mint_liquidity;
    pool.pool_account_a_bump = ctx.bumps.pool_account_a;
    pool.pool_account_b_bump = ctx.bumps.pool_account_b;

    // increase the pool count
    let amm = &mut ctx.accounts.amm;
    amm.pool_count = amm.pool_count + 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(fees: u64)]
pub struct CreatePool<'info> {
    #[account(
        mut,
        seeds = [b"amm"],
        bump = amm.amm_bump,
        constraint = admin.key() == amm.admin @ Errors::InvalidAdmin,  // it is also used to check owner
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(
        init,
        payer = payer,
        space = 8 + Pool::INIT_SPACE,
        seeds = [
            b"pool",
            fees.to_le_bytes().as_ref(),
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
        ],
        bump,
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        init,  // before creating this account we have to add rent sol in different instruction
        payer = payer,
        seeds = [
            b"liquidity",
            pool.key().as_ref()
        ],
        bump,
        mint::decimals = 6,
        mint::authority = mint_liquidity,
        mint::freeze_authority = mint_liquidity,
        mint::token_program = token_program
    )]
    pub mint_liquidity: Box<InterfaceAccount<'info, Mint>>, // liquidity token mint

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        token::mint = mint_a,
        token::authority = pool_account_a,
        seeds=[
            b"pool-account-a",
            pool.key().as_ref(),
            mint_a.key().as_ref()
        ],
        bump
    )]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        token::mint = mint_b,
        token::authority = pool_account_b,
        seeds=[
            b"pool-account-b",
            pool.key().as_ref(),
            mint_b.key().as_ref()
        ],
        bump
    )]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    /// check : Adding a admin to the AMM
    #[account(mut)]
    pub admin: AccountInfo<'info>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana ecosystem accounts
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
`}
            </pre>
          </Panel>

          {/* Add Liquidity Section */}
          <Panel header="3) Add Liquidity" key="3" style={{ color: "white" }}>
            <Paragraph>
              Liquidity providers deposit tokens into an existing pool to
              receive liquidity tokens (shares). The protocol allows deposits
              even in an uneven ratio.
            </Paragraph>
            <ul>
              <li>
                The first deposit mints a base amount (100 liquidity tokens) to
                prevent inflation attacks.
              </li>
              <li>
                If a provider deposits tokens in a different ratio than the pool
                reserves, the protocol automatically swaps the excess through a
                DEX to maintain the ratio.
              </li>
              <li>
                Decimal Handling: The UI accepts human-friendly decimal values
                (e.g., 1.5) and converts them into base units using the token’s
                decimals (e.g., if Token-A has 6 decimals, 1.5 becomes
                1,500,000).
              </li>
            </ul>
            <Paragraph>
              <Text strong>Example:</Text> Suppose the pool has:
              <br />• Token-A: 100 units • Token-B: 200 units A provider
              deposits 50 units of Token-A and 300 units of Token-B. The
              protocol calculates the optimal amounts and determines the
              liquidity tokens to mint based on the formula:
              <Text code>
                initial_liquidity = sqrt(minimal_amount_a * minimal_amount_b)
              </Text>
              .
            </Paragraph>
            <Paragraph>
              <Text strong>On-chain Snippet:</Text>
            </Paragraph>
            <pre
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "1rem",
              }}
            >
              {`use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

pub fn deposit_liquidity(
    ctx: Context<DepositLiquidity>,
    fees: u64,
    amount_a: u64,
    amount_b: u64,
    min_liquidity: u64,
) -> Result<()> {
    // Prevent depositing assets the depositor does not own
    require!(fees == ctx.accounts.pool.fees, Errors::InvalidFee);
    require!(
        amount_a <= ctx.accounts.depositor_account_a.amount,
        Errors::InsufficientBalance
    );
    require!(
        amount_b <= ctx.accounts.depositor_account_b.amount,
        Errors::InsufficientBalance
    );

    // Making sure they are provided in the same proportion as existing liquidity
    let pool_a = &ctx.accounts.pool_account_a;
    let pool_b = &ctx.accounts.pool_account_b;
    // Defining pool creation like this allows attackers to frontrun pool creation with bad ratios
    let pool_creation = pool_a.amount == 0 && pool_b.amount == 0;
    let (minimal_amount_a, minimal_amount_b) = if pool_creation {
        // Add as is if there is no liquidity
        (amount_a, amount_b)
    } else {
        let amount_b_optimal = (amount_a * pool_b.amount) / pool_a.amount;
        if amount_b_optimal <= amount_b {
            (amount_a, amount_b_optimal)
        } else {
            let amount_a_optimal = (amount_b * pool_a.amount) / pool_b.amount;
            require!(
                amount_a_optimal <= amount_a,
                Errors::InBalanceOptimalAmounts
            );
            (amount_a_optimal, amount_b)
        }
    };
    msg!(
        "amount-a: {} & amount-b: {}",
        minimal_amount_a,
        minimal_amount_b
    );

    // Computing the amount of liquidity about to be deposited
    let liquidity: u64 = if ctx.accounts.mint_liquidity.supply == 0 {
        let initial_liquidity = integer_sqrt(minimal_amount_a * minimal_amount_b);
        require!(
            initial_liquidity > MINIMUM_LIQUIDITY,
            Errors::InsufficientLiquidity
        );
        msg!("initial_liquidity = {}", initial_liquidity);
        initial_liquidity - MINIMUM_LIQUIDITY
    } else {
        let ratio_a = (minimal_amount_a * ctx.accounts.mint_liquidity.supply) / pool_a.amount;
        let ratio_b = (minimal_amount_b * ctx.accounts.mint_liquidity.supply) / pool_b.amount;
        if ratio_a > ratio_b {
            ratio_b
        } else {
            ratio_a
        }
    };

    require!(
        liquidity >= min_liquidity && liquidity >= MINIMUM_LIQUIDITY,
        Errors::MinLiquidityError
    );
    msg!("liquiidity: {}", liquidity);

    // Transfer tokens to the pool
    transfer_tokens(
        &ctx.accounts.depositor_account_a,
        &ctx.accounts.pool_account_a,
        &ctx.accounts.depositor,
        &ctx.accounts.token_program,
        minimal_amount_a,
    )?;
    transfer_tokens(
        &ctx.accounts.depositor_account_b,
        &ctx.accounts.pool_account_b,
        &ctx.accounts.depositor,
        &ctx.accounts.token_program,
        minimal_amount_b,
    )?;

    let pool_key = ctx.accounts.pool.key();

    // Use the authority_seeds in signer_seeds
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"liquidity",
        pool_key.as_ref(),
        &[ctx.accounts.pool.pool_mint_liquidity_bump],
    ]];

    mint_tokens(
        &ctx.accounts.mint_liquidity,
        &ctx.accounts.depositor_account_liquidity,
        &ctx.accounts.token_program,
        signer_seeds,
        liquidity,
    )?;

    msg!("Minted liquidity amount : {}", liquidity);

    Ok(())
}

fn integer_sqrt(number: u64) -> u64 {
    (number as f64).sqrt() as u64
}

#[derive(Accounts)]
#[instruction(fees: u64)]
pub struct DepositLiquidity<'info> {
    #[account(
        seeds = [b"amm"],
        bump = amm.amm_bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(
        seeds = [
            b"pool",
            fees.to_le_bytes().as_ref(),
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
        ],
        bump = pool.pool_bump,
        has_one = amm,
        has_one = mint_a,
        has_one = mint_b,
        has_one = pool_account_a,
        has_one = pool_account_b,
        has_one = mint_liquidity
    )]
    pub pool: Box<Account<'info, Pool>>,

    /// The account getting liquidity tokens & adding liquidity amount
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut)]
    pub mint_liquidity: Box<InterfaceAccount<'info, Mint>>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = depositor,
        associated_token::mint = mint_liquidity,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub depositor_account_liquidity: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub depositor_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub depositor_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Solana ecosystem accounts
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
`}
            </pre>
          </Panel>

          {/* Remove Liquidity Section */}
          <Panel
            header="4) Remove Liquidity"
            key="4"
            style={{ color: "white" }}
          >
            <Paragraph>
              To withdraw liquidity, providers burn their liquidity tokens. The
              withdrawn amount of Token-A and Token-B is proportional to the
              providers share of the total liquidity.
            </Paragraph>
            <Paragraph>
              <Text strong>Example:</Text> If a pool has 1000 liquidity tokens
              and a provider burns 100 tokens, they receive 10% of the pools
              underlying tokens.
            </Paragraph>
            <Paragraph>
              <Text strong>On‑chain Snippet:</Text>
            </Paragraph>
            <pre
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "1rem",
              }}
            >
              {`use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::errors::*;
use crate::state::*;
use crate::utils::*;

pub fn withdraw_liquidity(
    ctx: Context<WithdrawLiquidity>,
    fees: u64,
    liquidity_amount: u64,
    min_amount_a: u64,
    min_amount_b: u64,
) -> Result<()> {
    require!(liquidity_amount > 0, Errors::ZeroAmount);
    require!(fees == ctx.accounts.pool.fees, Errors::InvalidFee);
    // Transfer tokens from the pool
    let amount_a = (liquidity_amount * ctx.accounts.pool_account_a.amount) / ctx.accounts.mint_liquidity.supply;
    let amount_b = (liquidity_amount * ctx.accounts.pool_account_b.amount) / ctx.accounts.mint_liquidity.supply;

    require!(
        amount_a >= min_amount_a && amount_b >= min_amount_b,
        Errors::MinLiquidityError
    );

    // Burn the liquidity tokens
    burn_tokens(
        &ctx.accounts.mint_liquidity,
        &ctx.accounts.depositor_account_liquidity,
        &ctx.accounts.depositor,
        &ctx.accounts.token_program,
        liquidity_amount,
    )?;

    let pool_key = ctx.accounts.pool.key();
    let mint_a_key = ctx.accounts.mint_a.key();

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"pool-account-a",
        pool_key.as_ref(),
        mint_a_key.as_ref(),
        &[ctx.accounts.pool.pool_account_a_bump],
    ]];

    transfer_tokens_with_seeds(
        &ctx.accounts.pool_account_a,
        &ctx.accounts.depositor_account_a,
        &ctx.accounts.pool_account_a,
        &ctx.accounts.token_program,
        signer_seeds,
        amount_a,
    )?;

    let pool_key = ctx.accounts.pool.key();
    let mint_b_key = ctx.accounts.mint_b.key();

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"pool-account-b",
        pool_key.as_ref(),
        mint_b_key.as_ref(),
        &[ctx.accounts.pool.pool_account_b_bump],
    ]];

    transfer_tokens_with_seeds(
        &ctx.accounts.pool_account_b,
        &ctx.accounts.depositor_account_b,
        &ctx.accounts.pool_account_b,
        &ctx.accounts.token_program,
        signer_seeds,
        amount_b,
    )?;

    msg!(
        "Burned {} tokens and got amount-A : {} and amount-B : {}",
        liquidity_amount,
        amount_a,
        amount_b
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(fees: u64)]
pub struct WithdrawLiquidity<'info> {
    #[account(
        seeds = [b"amm"],
        bump = amm.amm_bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(
        mut,
        seeds = [
            b"pool",
            fees.to_le_bytes().as_ref(),
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
        ],
        bump = pool.pool_bump,
        has_one = mint_a,
        has_one = mint_b,
        has_one = pool_account_a,
        has_one = pool_account_b,
        has_one = mint_liquidity
    )]
    pub pool: Box<Account<'info, Pool>>,

    /// The account paying for all rents
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut)]
    pub mint_liquidity: InterfaceAccount<'info, Mint>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_liquidity,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub depositor_account_liquidity: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = depositor,
        associated_token::mint = mint_a,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub depositor_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = depositor,
        associated_token::mint = mint_b,
        associated_token::authority = depositor,
        associated_token::token_program = token_program,
    )]
    pub depositor_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Solana ecosystem accounts
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
`}
            </pre>
          </Panel>

          {/* Swap Tokens Section */}
          <Panel
            header="5) Swap Tokens (Exact Input & Exact Output)"
            key="5"
            style={{ color: "white" }}
          >
            <Paragraph>Swaps are performed in one of two ways:</Paragraph>
            <ul>
              <li>
                <Text strong>Exact Input Swap:</Text> The user specifies the
                input token amount. The protocol deducts fees and calculates the
                amount of output tokens based on the pool reserves.
              </li>
              <li>
                <Text strong>Exact Output Swap:</Text> The user specifies the
                desired output token amount. The protocol determines the
                required input amount (including fees).
              </li>
            </ul>
            <Paragraph>
              <Text strong>Example (Exact Input):</Text> Assume the pool has:
            </Paragraph>
            <ul>
              <li>Pool Account-A (Token-A): 100 units</li>
              <li>Pool Account-B (Token-B): 200 units</li>
            </ul>
            <Paragraph>
              If a user sends an input of 50 Token-B units with a fee tier of 30
              (0.3%), the fee (50 * 30 / 10000 = 0.15) is deducted. The
              effective input is ~49.85 units. The output amount is calculated
              as:
            </Paragraph>
            <pre
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "1rem",
              }}
            >
              {`output_amount = (taxed_input * pool_account_a.amount) / (pool_account_b.amount + taxed_input)
// Approx: (49.85 * 100) / (200 + 49.85) ≈ 16.1 units`}
            </pre>
            <Paragraph>
              <Text strong>Example (Exact Output):</Text> If a user desires 20
              Token-A units, the protocol computes the necessary input including
              fees.
            </Paragraph>
            <pre
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "1rem",
              }}
            >
              {`input_amount = (output_amount * (pool_account_b.amount - output_amount)) / pool_account_a.amount
fee_amount = (input_amount * fees) / PRECISION
taxed_input = input_amount + fee_amount`}
            </pre>
            <Paragraph>
              <Text strong>On‑chain Code Snippets:</Text>
            </Paragraph>
            <Collapse
              bordered
              style={{ backgroundColor: "black", color: "white" }}
            >
              <Panel header="Exact Input Swap Code" key="5a">
                <pre
                  style={{
                    backgroundColor: "#333",
                    color: "white",
                    padding: "1rem",
                  }}
                >
                  {`use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

pub fn swap_exact_input(
    ctx: Context<SwapExactInput>,
    fees: u64,
    swap_a: bool, // output should be mint_a
    input_amount: u64,
    min_output_amount: u64,
    delta_price_change: u64,
) -> Result<()> {
    // Prevent depositing assets the depositor does not own
    require!(input_amount > 0, Errors::ZeroAmount);
    require!(fees == ctx.accounts.pool.fees, Errors::InvalidFee);
    require!(
        delta_price_change > 0 && delta_price_change <= 10000,
        Errors::InvalidDeltaPrice
    );
    if swap_a {
        require!(
            ctx.accounts.trader_account_b.amount >= input_amount,
            Errors::InsufficientBalance
        );
    } else {
        require!(
            ctx.accounts.trader_account_a.amount >= input_amount,
            Errors::InsufficientBalance
        );
    }

    // Apply trading fee, used to compute the output
    let fee_amount = (input_amount * fees) / PRECISION;
    let taxed_input = input_amount - fee_amount;

    let pool_a = &ctx.accounts.pool_account_a;
    let pool_b = &ctx.accounts.pool_account_b;
    let output_amount = if swap_a {
        (taxed_input * pool_a.amount) / (pool_b.amount + taxed_input)
    } else {
        (taxed_input * pool_b.amount) / (pool_a.amount + taxed_input)
    };

    require!(output_amount >= min_output_amount, Errors::OutputTooSmall);

    if swap_a {
        require!(
            delta_price_change >= get_price_percentage_changed(
                pool_a.amount,
                pool_b.amount,
                pool_a.amount - output_amount,
                pool_b.amount + input_amount,
            ),
            Errors::InvalidPriceChange,
        );
    } else {
        require!(
            delta_price_change >= get_price_percentage_changed(
                pool_a.amount,
                pool_b.amount,
                pool_a.amount + input_amount,
                pool_b.amount - output_amount,
            ),
            Errors::InvalidPriceChange,
        );
    }

    if swap_a {
        transfer_tokens(
            &ctx.accounts.trader_account_b,
            &ctx.accounts.pool_account_b,
            &ctx.accounts.trader,
            &ctx.accounts.token_program,
            input_amount,
        )?;

        let pool_key = ctx.accounts.pool.key();
        let mint_a_key = ctx.accounts.mint_a.key();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"pool-account-a",
            pool_key.as_ref(),
            mint_a_key.as_ref(),
            &[ctx.accounts.pool.pool_account_a_bump],
        ]];

        transfer_tokens_with_seeds(
            &ctx.accounts.pool_account_a,
            &ctx.accounts.trader_account_a,
            &ctx.accounts.pool_account_a,
            &ctx.accounts.token_program,
            signer_seeds,
            output_amount,
        )?;
    } else {
        transfer_tokens(
            &ctx.accounts.trader_account_a,
            &ctx.accounts.pool_account_a,
            &ctx.accounts.trader,
            &ctx.accounts.token_program,
            input_amount,
        )?;

        let pool_key = ctx.accounts.pool.key();
        let mint_b_key = ctx.accounts.mint_b.key();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"pool-account-b",
            pool_key.as_ref(),
            mint_b_key.as_ref(),
            &[ctx.accounts.pool.pool_account_b_bump],
        ]];

        transfer_tokens_with_seeds(
            &ctx.accounts.pool_account_b,
            &ctx.accounts.trader_account_b,
            &ctx.accounts.pool_account_b,
            &ctx.accounts.token_program,
            signer_seeds,
            output_amount,
        )?;
    }

    msg!(
        "Traded {} tokens ({} after fees) for {}",
        input_amount,
        taxed_input,
        output_amount
    );

    Ok(())
}

fn get_price_percentage_changed(
    before_amount_a: u64,
    before_amount_b: u64,
    after_amount_a: u64,
    after_amount_b: u64,
) -> u64 {
    let numerator = ((before_amount_a * after_amount_b) as i64
        - (before_amount_b * after_amount_a) as i64)
        .abs() as u64;
    let denominator = before_amount_b * after_amount_a;
    (numerator * PRECISION) / denominator
}

#[derive(Accounts)]
#[instruction(fees: u64)]
pub struct SwapExactInput<'info> {
    #[account(
        seeds = [b"amm"],
        bump = amm.amm_bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(
        mut,
        seeds = [
            b"pool",
            fees.to_le_bytes().as_ref(),
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
        ],
        bump = pool.pool_bump,
        has_one = amm,
        has_one = mint_a,
        has_one = mint_b,
        has_one = pool_account_a,
        has_one = pool_account_b,
    )]
    pub pool: Box<Account<'info, Pool>>,

    /// The account doing the swap
    #[account(mut)]
    pub trader: Signer<'info>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = mint_a,
        associated_token::authority = trader,
        associated_token::token_program = token_program,
    )]
    pub trader_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = mint_b,
        associated_token::authority = trader,
        associated_token::token_program = token_program,
    )]
    pub trader_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Solana ecosystem accounts
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
`}
                </pre>
              </Panel>
              <Panel header="Exact Output Swap Code" key="5b">
                <pre
                  style={{
                    backgroundColor: "#333",
                    color: "white",
                    padding: "1rem",
                  }}
                >
                  {`use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

pub fn swap_exact_output(
    ctx: Context<SwapExactOutput>,
    fees: u64,
    swap_a: bool, // output should be mint_a
    output_amount: u64,
    max_input_amount: u64,
    delta_price_change: u64,
) -> Result<()> {
    // Prevent depositing assets the depositor does not own
    require!(output_amount > 0, Errors::ZeroAmount);
    require!(fees == ctx.accounts.pool.fees, Errors::InvalidFee);
    if swap_a {
        require!(
            ctx.accounts.pool_account_a.amount > output_amount,
            Errors::InsufficientBalance
        );
    } else {
        require!(
            ctx.accounts.pool_account_b.amount > output_amount,
            Errors::InsufficientBalance
        );
    }

    let pool_a = &ctx.accounts.pool_account_a;
    let pool_b = &ctx.accounts.pool_account_b;

    let input_amount = if swap_a {
        (output_amount * pool_b.amount) / (pool_a.amount - output_amount)
    } else {
        (output_amount * pool_a.amount) / (pool_b.amount - output_amount)
    };

    let fee_amount = (input_amount * fees) / PRECISION;
    let taxed_input = input_amount + fee_amount;

    require!(taxed_input <= max_input_amount, Errors::OutputTooHigh);
    require!(
        taxed_input < if swap_a {
            ctx.accounts.trader_account_b.amount
        } else {
            ctx.accounts.trader_account_a.amount
        },
        Errors::InsufficientBalance
    );

    if swap_a {
        require!(
            delta_price_change >= get_price_percentage_changed(
                pool_a.amount,
                pool_b.amount,
                pool_a.amount - output_amount,
                pool_b.amount + taxed_input,
            ),
            Errors::InvalidPriceChange,
        );
    } else {
        require!(
            delta_price_change >= get_price_percentage_changed(
                pool_a.amount,
                pool_b.amount,
                pool_a.amount + taxed_input,
                pool_b.amount - output_amount,
            ),
            Errors::InvalidPriceChange,
        );
    }

    if swap_a {
        transfer_tokens(
            &ctx.accounts.trader_account_b,
            &ctx.accounts.pool_account_b,
            &ctx.accounts.trader,
            &ctx.accounts.token_program,
            taxed_input,
        )?;

        let pool_key = ctx.accounts.pool.key();
        let mint_a_key = ctx.accounts.mint_a.key();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"pool-account-a",
            pool_key.as_ref(),
            mint_a_key.as_ref(),
            &[ctx.accounts.pool.pool_account_a_bump],
        ]];

        transfer_tokens_with_seeds(
            &ctx.accounts.pool_account_a,
            &ctx.accounts.trader_account_a,
            &ctx.accounts.pool_account_a,
            &ctx.accounts.token_program,
            signer_seeds,
            output_amount,
        )?;
    } else {
        transfer_tokens(
            &ctx.accounts.trader_account_a,
            &ctx.accounts.pool_account_a,
            &ctx.accounts.trader,
            &ctx.accounts.token_program,
            taxed_input,
        )?;

        let pool_key = ctx.accounts.pool.key();
        let mint_b_key = ctx.accounts.mint_b.key();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"pool-account-b",
            pool_key.as_ref(),
            mint_b_key.as_ref(),
            &[ctx.accounts.pool.pool_account_b_bump],
        ]];

        transfer_tokens_with_seeds(
            &ctx.accounts.pool_account_b,
            &ctx.accounts.trader_account_b,
            &ctx.accounts.pool_account_b,
            &ctx.accounts.token_program,
            signer_seeds,
            output_amount,
        )?;
    }

    msg!(
        "Traded {} tokens ({} after fees) for {}",
        input_amount,
        taxed_input,
        output_amount
    );

    Ok(())
}

fn get_price_percentage_changed(
    before_amount_a: u64,
    before_amount_b: u64,
    after_amount_a: u64,
    after_amount_b: u64,
) -> u64 {
    let numerator = ((before_amount_a * after_amount_b) as i64
        - (before_amount_b * after_amount_a) as i64)
        .abs() as u64;
    let denominator = before_amount_b * after_amount_a;
    (numerator * PRECISION) / denominator
}

#[derive(Accounts)]
#[instruction(fees: u64)]
pub struct SwapExactOutput<'info> {
    #[account(
        seeds = [b"amm"],
        bump = amm.amm_bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(
        mut,
        seeds = [
            b"pool",
            fees.to_le_bytes().as_ref(),
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
        ],
        bump = pool.pool_bump,
        has_one = amm,
        has_one = mint_a,
        has_one = mint_b,
        has_one = pool_account_a,
        has_one = pool_account_b
    )]
    pub pool: Box<Account<'info, Pool>>,

    /// The account doing the swap
    #[account(mut)]
    pub trader: Signer<'info>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = mint_a,
        associated_token::authority = trader,
        associated_token::token_program = token_program,
    )]
    pub trader_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = mint_b,
        associated_token::authority = trader,
        associated_token::token_program = token_program,
    )]
    pub trader_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Solana ecosystem accounts
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
`}
                </pre>
              </Panel>
            </Collapse>
          </Panel>
        </Collapse>

        <Divider style={{ borderColor: "gray" }} />

        {/* Helper Functions */}
        <Title level={3}>Helper Functions</Title>
        <Paragraph>
          <Text strong>integer_sqrt:</Text> This function computes the square
          root of a given number (truncated to an integer) using floating‑point
          arithmetic. For instance,
          <Text code>integer_sqrt(5000)</Text> returns approximately{" "}
          <Text code>70</Text> since √5000 ≈ 70.71.
        </Paragraph>
        <Paragraph>
          <Text strong>get_price_percentage_changed:</Text> This function
          calculates the percentage change in price before and after a swap,
          ensuring that the slippage remains within acceptable limits. It works
          by taking the difference between the products of pool reserves pre-
          and post-swap, scaling by a precision constant.
        </Paragraph>
        <pre
          style={{ backgroundColor: "#333", color: "white", padding: "1rem" }}
        >
          {`fn get_price_percentage_changed(
    before_amount_a: u64,
    before_amount_b: u64,
    after_amount_a: u64,
    after_amount_b: u64,
) -> u64 {
    let numerator = ((before_amount_a * after_amount_b) as i64 -
                     (before_amount_b * after_amount_a) as i64).abs() as u64;
    let denominator = before_amount_b * after_amount_a;
    (numerator * PRECISION) / denominator
}`}
        </pre>
        <Paragraph>
          Here, if <Text code>PRECISION</Text> is set to 10000, then a 1% change
          is represented by approximately 100 on this scale.
        </Paragraph>

        <Divider style={{ borderColor: "gray" }} />

        {/* Security Considerations */}
        <Title level={3}>Security Considerations</Title>
        <Paragraph>
          <Text strong>1. Signer Verification:</Text> Critical operations (e.g.,
          pool creation, liquidity deposit) require the correct account
          signatures to prevent unauthorized actions.
        </Paragraph>
        <Paragraph>
          <Text strong>2. PDA Derivation:</Text> All PDAs for pools, liquidity
          tokens, and token accounts are derived using fixed seeds (including
          fee values and token mints). This ensures account uniqueness and
          prevents malicious replication.
        </Paragraph>
        <Paragraph>
          <Text strong>3. Fee and Slippage Checks:</Text> The protocol enforces
          that the chosen fee tier matches the pool’s fee and uses slippage
          tolerance thresholds to guard against market manipulation.
        </Paragraph>
        <Paragraph>
          <Text strong>4. Minimum Liquidity Protection:</Text> The system mints
          a baseline of liquidity tokens during the initial deposit (e.g., 100
          tokens) to prevent inflation attacks.
        </Paragraph>
        <Paragraph>
          <Text strong>5. Safe CPI Calls:</Text> Token transfers, minting, and
          burning are executed via Anchor’s Cross-Program Invocation (CPI) which
          perform additional account validations.
        </Paragraph>
        <Paragraph>
          <Text strong>6. Input Validation & Decimal Conversion:</Text> All
          inputs are checked for non-zero amounts and correct token ordering.
          The UI converts user-friendly decimals to base units, ensuring
          precision and avoiding rounding errors.
        </Paragraph>
        <Paragraph>
          <Text strong>7. External DEX Interaction:</Text> When adding liquidity
          with an uneven ratio, the protocol uses a DEX (like Raydium) to swap
          the excess tokens securely. The swap calculations are rigorously
          designed to maintain the price invariant.
        </Paragraph>
      </Typography>
    </div>
  );
}
