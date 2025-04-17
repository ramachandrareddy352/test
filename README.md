# SOLANA‑PAY DEX

A decentralized exchange (DEX) built on the Solana blockchain, featuring a novel integration of Solana Pay for secure and user‑friendly token swaps and liquidity management. Developed as a minor project by students at Rajiv Gandhi University of Knowledge Technologies, this project introduces a QR code‑based transaction signing mechanism to enhance security by decoupling transaction approval from the web interface.

**Program Address:** `FAoQiEDBmQW7aPNwcsdp988aoDNSwSbxfxSMKxaqSEhY`  
**Live Demo:** [Solana-Pay DEX](https://test-tau-five-61.vercel.app/)


---

## Table of Contents

1. [Overview](#overview)  
2. [Key Features](#key-features)  
3. [Example Calculations](#example-calculations)  
   - [Swap Exact Input](#swap-exact-input)  
   - [Swap Exact Output](#swap-exact-output)  
   - [Deposit Liquidity](#deposit-liquidity)  
   - [Withdraw Liquidity](#withdraw-liquidity)  
4. [Prerequisites](#prerequisites)  
5. [Getting Started](#getting-started)  
   1. [Clone the Repository](#clone-the-repository)  
   2. [Set Up the Frontend](#set-up-the-frontend)  
   3. [Set Up the Anchor Project](#set-up-the-anchor-project)  
   4. [Configure Solana CLI](#configure-solana-cli)  
   5. [Deploy the Smart Contract](#deploy-the-smart-contract)  
   6. [Run Tests](#run-tests)  
6. [Project Structure](#project-structure)  
7. [Usage](#usage)  
8. [Contributing](#contributing)  
9. [License](#license)  
10. [References](#references)  
11. [Acknowledgments](#acknowledgments)  

---

## Overview

SOLANA‑PAY DEX is an Automated Market Maker (AMM) that supports:

- Token swaps (exact input and output)  
- Liquidity provision and withdrawal  

Built with Rust and the Anchor framework, it uses QR codes for transaction signing via Solana Pay–compatible wallets (e.g., Phantom, Solflare). This minimizes trust in the frontend and mitigates phishing or malicious signing risks.

---

## Key Features

- **Solana Pay Integration**  
  Secure approval of swaps and liquidity operations via QR code scanning on a trusted mobile wallet.

- **Constant Product AMM**  
  Uniswap V2‑style constant product market maker logic with configurable fees (default 0.3%).

- **Core Functionalities**  
  - Swap Exact Input  
  - Swap Exact Output  
  - Deposit Liquidity  
  - Withdraw Liquidity

- **Frontend**  
  Built with Next.js, React, TypeScript, Tailwind CSS. Supports both Solana Pay and traditional wallet connections via `@solana/wallet-adapter`.

- **Security**  
  Transaction signing occurs in the user’s mobile wallet, reducing frontend trust.

- **Deployment**  
  - Smart contract on Solana  
  - Frontend hosted on Vercel

---

## Example Calculations

Based on the constant product formula:  
\[
k = x * y
\]

### Swap Exact Input

Swap a fixed amount of Token A (Δxₙ) for Token B.

`Δy_out = (y × Δx_in × (1 - fee)) / (x + Δx_in × (1 - fee))`

**Example**  
- Pool: x = 1000 SOL, y = 200,000 USDC  
- Input: Δxₙ = 10 SOL  
- Fee: 0.3% (0.003)  
- Effective Input: 9.97 SOL  

New pool: x′ = 1009.97 SOL, y′ = 198,025.684 USDC

---

### Swap Exact Output

Receive a fixed amount of Token B (Δyₙ) by spending Token A.

`Δx_in = (x × Δy_out) / ((y - Δy_out) × (1 - fee))`

**Example**  
- Desired Output: Δyₙ = 2000 USDC  

Effective Input: 10.1006 SOL  
New pool: x′ = 1010.1006 SOL, y′ = 198,000 USDC

---

### Deposit Liquidity

Add tokens proportionally and receive LP tokens.

`Δl = l × (Δx/x)`
`Δy = (y × Δx)/x`

**Example**  
- Pool: x = 1000 SOL, y = 200,000 USDC, l = 10,000 LP  
- Deposit: Δx = 50 SOL  

New pool: x′ = 1050 SOL, y′ = 210,000 USDC, l′ = 10,500 LP

---

### Withdraw Liquidity

Burn LP tokens to retrieve proportional reserves.

`Δx = x × (Δl/l)`
`Δy = y × (Δl/l)`

**Example**  
- Burn: Δl = 500 LP  

New pool: x′ = 1000 SOL, y′ = 200,000 USDC, l′ = 10,000 LP

---

## Prerequisites

- **Node.js** v16+ & PNPM (`npm install -g pnpm`)  
- **Rust & Cargo** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)  
- **Solana CLI**  
  ```bash
  sh -c "https://release.solana.com/stable/install"
  ```  
- **Anchor CLI**  
  ```bash
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
  ```  
- **Git**  
- A Solana wallet keypair (e.g., `solana-keygen new`)  
- Access to a Solana RPC node (Devnet/Testnet/Mainnet)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/solana-pay-dex.git
cd solana-pay-dex
```

### 2. Set Up the Frontend
```bash
pnpm install
touch .env.local
```

**.env.local**  
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=FAoQiEDBmQW7aPNwcsdp988aoDNSwSbxfxSMKxaqSEhY
```

```bash
pnpm dev
```

---

### 3. Set Up the Anchor Project
```bash
cd anchor
pnpm install
anchor build
```

---

### 4. Configure Solana CLI
```bash
solana config set --url https://api.devnet.solana.com
solana airdrop 2
solana config set --keypair ~/.config/solana/id.json
```

---

### 5. Deploy the Smart Contract
```bash
anchor deploy
```
> After deployment, update `NEXT_PUBLIC_PROGRAM_ID` in `.env.local`

---

### 6. Run Tests
```bash
anchor test
```

---

## Project Structure

```
solana-pay-dex/
├── anchor/
│   ├── programs/
│   │   └── rcr-dex/
│   ├── tests/
│   └── Anchor.toml
├── src/
│   ├── app/
│   └── components/
├── public/
├── tailwind.config.ts
├── pnpm-lock.yaml
├── vercel.json
└── README.md
```

```shell
ramachandrareddy352-test/
├── next.config.mjs
├── .eslintrc.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── LICENSE
├── tsconfig.json
├── README.md
├── pnpm-lock.yaml
└── src/
    ├── components/
    │   ├── swap/
    │   │   ├── swap-mutation.tsx
    │   │   └── swap-ui.tsx
    │   ├── solana/
    │   │   └── solana-provider.tsx
    │   ├── ui/
    │   │   └── ui-layout.tsx
    │   ├── pools/
    │   │   ├── pool-ui.tsx
    │   │   ├── create-pools.tsx
    │   │   ├── pool-mutation.tsx
    │   │   └── view-pools.tsx
    │   ├── cluster/
    │   │   ├── cluster-data-access.tsx
    │   │   └── cluster-ui.tsx
    │   ├── liquidity/
    │   │   ├── liquidity-ui.tsx
    │   │   ├── data-mutaion.tsx
    │   │   ├── remove-liquidity.tsx
    │   │   └── add-liquidity.tsx
    │   ├── data-access/
    │   │   ├── account-ui.tsx
    │   │   └── account-data-access.tsx
    │   └── home/
    │       ├── home-page-ui.tsx
    │       └── home-css.css
    └── app/
        ├── api/
        │   └── create_pool/
        │   |   └── route.ts
        │   └── deposit_liquidity/
        │   |    └── route.ts
        │   └── swap_exact_input/
        │   |    └── route.ts
        │   └── swap_exact_output/
        │   |    └── route.ts
        │   └── withdraw_liquidiy/
        │       └── route.ts
        |   └── MockWallet.ts
        ├── page.tsx
        ├── globals.css
        ├── swap/
        │   └── page.tsx
        ├── pools/
        │   └── page.tsx
        ├── liquidity/
        │   └── page.tsx
        ├── layout.tsx
        └── react-query-provider.tsx
```

---

## Usage

1. Access the frontend (`localhost:3000` or deployed URL).  
2. Connect via wallet adapter or Solana Pay.  
3. Perform swaps, deposits, and withdrawals via QR codes or UI.  
4. View pool reserves in the “View Pools” section.

---

## Contributing

1. Fork the repo.  
2. Create a feature branch:  
   ```bash
   git checkout -b feature/your-feature
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "Add awesome feature"
   ```  
4. Push and open a Pull Request.

Ensure tests pass and follow the existing coding style.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## References

- [Solana Documentation](https://docs.solana.com/)  
- [Anchor Framework](https://www.anchor-lang.com/)  
- [Solana Pay Documentation](https://solanapay.com/)  
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)

---

## Acknowledgments

Developed by T. RamaChandra Reddy, P. Prasad, B. Nagendra Reddy, H. Maneesh, and K. Mukunda under the guidance of Mr. Sravan Kumar at Rajiv Gandhi University of Knowledge Technologies, Nuzvid Campus.
