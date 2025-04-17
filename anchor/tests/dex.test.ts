import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import { getAccount, getMint, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";

describe("Test", () => {
  it("initialize", async () => {
    try {
      const ammAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("amm")],
        pg.PROGRAM_ID
      )[0];
      console.log(`Program ID is deployed at - ${pg.PROGRAM_ID.toString()}`);

      // Send transaction
      const txHash = await pg.program.methods
        .createAmm()
        .accounts({
          amm: ammAccount,
          payer: pg.wallets.wallet4.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pg.wallets.wallet4.keypair])
        .rpc();
      console.log(`AMM is created at transaction - ${txHash.toString()}`);
    } catch (error) {
      console.log(error);
    }
  });

  it("create pool", async () => {
    try {
      const fees = 10;

      const ammAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("amm")],
        pg.PROGRAM_ID
      )[0];

      const mint_a = new web3.PublicKey(
        "Gvi3gqecizXrhEKpaqKPMz4VduHyu6KULTURKNq577AE"
      );
      const mint_b = new web3.PublicKey(
        "7UqEjPkUV3aL8aMJToVMGHXHXLAKotAgvTGQPJf72J3m"
      );

      const [poolAccount, _poolBump] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool"),
          new BN(fees).toArrayLike(Buffer, "le", 8),
          ammAccount.toBuffer(),
          mint_a.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      );

      const mint_liquidity = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("liquidity"), poolAccount.toBuffer()],
        pg.PROGRAM_ID
      )[0];

      const pool_account_a = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-a"),
          poolAccount.toBuffer(),
          mint_a.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const pool_account_b = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-b"),
          poolAccount.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];

      // Send transaction
      const txHash = await pg.program.methods
        .createPool(new BN(fees))
        .accounts({
          amm: ammAccount,
          pool: poolAccount,
          mintLiquidity: mint_liquidity,
          mintA: mint_a,
          mintB: mint_b,
          poolAccountA: pool_account_a,
          poolAccountB: pool_account_b,
          payer: pg.wallets.wallet4.publicKey,
          tokenProgram: new web3.PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
          associatedTokenProgram: new web3.PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          ),
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pg.wallets.wallet4.keypair])
        .rpc();
      console.log(`Liquidity Pool create at transaction ${txHash.toString()}`);
    } catch (error) {
      console.log(error);
    }
  });

  it("Deposit liquidity", async () => {
    try {
      const fees = 10;

      const ammAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("amm")],
        pg.PROGRAM_ID
      )[0];

      const mint_a = new web3.PublicKey(
        "Gvi3gqecizXrhEKpaqKPMz4VduHyu6KULTURKNq577AE"
      );
      const mint_b = new web3.PublicKey(
        "7UqEjPkUV3aL8aMJToVMGHXHXLAKotAgvTGQPJf72J3m"
      );

      const poolAccount = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool"),
          new BN(fees).toArrayLike(Buffer, "le", 8),
          ammAccount.toBuffer(),
          mint_a.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];

      const mint_liquidity = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("liquidity"), poolAccount.toBuffer()],
        pg.PROGRAM_ID
      )[0];

      const pool_account_a = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-a"),
          poolAccount.toBuffer(),
          mint_a.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const pool_account_b = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-b"),
          poolAccount.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];

      const depositor_account_a = await getAssociatedTokenAddress(
        mint_a,
        pg.wallets.wallet4.publicKey
      );
      const depositor_account_b = await getAssociatedTokenAddress(
        mint_b,
        pg.wallets.wallet4.publicKey
      );
      const depositor_account_liquidity = await getAssociatedTokenAddress(
        mint_liquidity,
        pg.wallets.wallet4.publicKey
      );

      // Get initial balances
      const initialDepositorA = (await getAccount(pg.program.provider.connection, depositor_account_a)).amount;
      const initialDepositorB = (await getAccount(pg.program.provider.connection, depositor_account_b)).amount;
      const initialPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const initialPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const initialMintSupply = (await getMint(pg.program.provider.connection, mint_liquidity)).supply;
      let initialDepositorLiquidity = 0n;
      try {
        initialDepositorLiquidity = (await getAccount(pg.program.provider.connection, depositor_account_liquidity)).amount;
      } catch (e) {
        // If the account doesn't exist yet
      }

      const amountA = BigInt(1000000000);
      const amountB = BigInt(1000000000000);
      const product = amountA * amountB;
      const sqrtProduct = BigInt(Math.floor(Math.sqrt(Number(product))));
      const liquidity = sqrtProduct - 100n; // MINIMUM_LIQUIDITY = 100

      // Send transaction
      const txHash = await pg.program.methods
        .depositLiquidity(
          new BN(fees),
          new BN(amountA.toString()),
          new BN(amountB.toString()),
          new BN(101)
        )
        .accounts({
          amm: ammAccount,
          pool: poolAccount,
          depositor: pg.wallets.wallet4.publicKey,
          mintLiquidity: mint_liquidity,
          mintA: mint_a,
          mintB: mint_b,
          poolAccountA: pool_account_a,
          poolAccountB: pool_account_b,
          depositorAccountLiquidity: depositor_account_liquidity,
          depositorAccountA: depositor_account_a,
          depositorAccountB: depositor_account_b,
          tokenProgram: new web3.PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
          associatedTokenProgram: new web3.PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          ),
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pg.wallets.wallet4.keypair])
        .rpc();
      console.log(`Liquidity is deposited tx:=> ${txHash}`);

      // Get final balances
      const finalDepositorA = (await getAccount(pg.program.provider.connection, depositor_account_a)).amount;
      const finalDepositorB = (await getAccount(pg.program.provider.connection, depositor_account_b)).amount;
      const finalPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const finalPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const finalMintSupply = (await getMint(pg.program.provider.connection, mint_liquidity)).supply;
      const finalDepositorLiquidity = (await getAccount(pg.program.provider.connection, depositor_account_liquidity)).amount;

      // Asserts
      assert.equal(initialPoolA, 0n, "Initial pool A balance should be 0");
      assert.equal(initialPoolB, 0n, "Initial pool B balance should be 0");
      assert.equal(initialMintSupply, 0n, "Initial liquidity supply should be 0");
      assert.equal(initialDepositorLiquidity, 0n, "Initial depositor liquidity balance should be 0");

      assert.equal(finalPoolA, amountA, "Pool A balance should increase by amountA");
      assert.equal(finalPoolB, amountB, "Pool B balance should increase by amountB");
      assert.equal(finalDepositorA, initialDepositorA - amountA, "Depositor A balance should decrease by amountA");
      assert.equal(finalDepositorB, initialDepositorB - amountB, "Depositor B balance should decrease by amountB");
      assert.equal(finalMintSupply, liquidity, "Liquidity supply should equal calculated liquidity");
      assert.equal(finalDepositorLiquidity, liquidity, "Depositor liquidity balance should equal calculated liquidity");
    } catch (error) {
      console.log(error);
    }
  });

  it("Swap exact input", async () => {
    try {
      const fees = 10;
      const PRECISION = 10000;

      const ammAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("amm")],
        pg.PROGRAM_ID
      )[0];
      const mint_a = new web3.PublicKey(
        "Gvi3gqecizXrhEKpaqKPMz4VduHyu6KULTURKNq577AE"
      );
      const mint_b = new web3.PublicKey(
        "7UqEjPkUV3aL8aMJToVMGHXHXLAKotAgvTGQPJf72J3m"
      );
      const poolAccount = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool"),
          new BN(fees).toArrayLike(Buffer, "le", 8),
          ammAccount.toBuffer(),
          mint_a.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];

      const pool_account_a = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-a"),
          poolAccount.toBuffer(),
          mint_a.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const pool_account_b = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-b"),
          poolAccount.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const trader_account_a = await getAssociatedTokenAddress(
        mint_a,
        pg.wallets.wallet4.publicKey
      );
      const trader_account_b = await getAssociatedTokenAddress(
        mint_b,
        pg.wallets.wallet4.publicKey
      );

      // Get initial balances
      const initialPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const initialPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const initialTraderA = (await getAccount(pg.program.provider.connection, trader_account_a)).amount;
      const initialTraderB = (await getAccount(pg.program.provider.connection, trader_account_b)).amount;

      const inputAmount = BigInt(100000);
      const swapA = true; // Swap B for A
      const feeAmount = (inputAmount * BigInt(fees)) / BigInt(PRECISION);
      const taxedInput = inputAmount - feeAmount;
      const outputAmount = (taxedInput * initialPoolA) / (initialPoolB + taxedInput);

      // Send transaction
      const txHash = await pg.program.methods
        .swapExactInput(new BN(fees), swapA, new BN(inputAmount.toString()), new BN(10), new BN(100))
        .accounts({
          amm: ammAccount,
          pool: poolAccount,
          trader: pg.wallets.wallet4.publicKey,
          mintA: mint_a,
          mintB: mint_b,
          poolAccountA: pool_account_a,
          poolAccountB: pool_account_b,
          traderAccountA: trader_account_a,
          traderAccountB: trader_account_b,
          tokenProgram: new web3.PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
          associatedTokenProgram: new web3.PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          ),
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pg.wallets.wallet4.keypair])
        .rpc();
      console.log(`swap exact input tx: => ${txHash}`);

      // Get final balances
      const finalPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const finalPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const finalTraderA = (await getAccount(pg.program.provider.connection, trader_account_a)).amount;
      const finalTraderB = (await getAccount(pg.program.provider.connection, trader_account_b)).amount;

      // Asserts
      assert.equal(finalPoolA, initialPoolA - outputAmount, "Pool A balance should decrease by outputAmount");
      assert.equal(finalPoolB, initialPoolB + inputAmount, "Pool B balance should increase by inputAmount");
      assert.equal(finalTraderA, initialTraderA + outputAmount, "Trader A balance should increase by outputAmount");
      assert.equal(finalTraderB, initialTraderB - inputAmount, "Trader B balance should decrease by inputAmount");
    } catch (error) {
      console.log(error);
    }
  });

  it("Swap exact output", async () => {
    try {
      const fees = 10;
      const PRECISION = 10000;

      const ammAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("amm")],
        pg.PROGRAM_ID
      )[0];
      const mint_a = new web3.PublicKey(
        "Gvi3gqecizXrhEKpaqKPMz4VduHyu6KULTURKNq577AE"
      );
      const mint_b = new web3.PublicKey(
        "7UqEjPkUV3aL8aMJToVMGHXHXLAKotAgvTGQPJf72J3m"
      );
      const poolAccount = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool"),
          new BN(fees).toArrayLike(Buffer, "le", 8),
          ammAccount.toBuffer(),
          mint_a.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];

      const pool_account_a = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-a"),
          poolAccount.toBuffer(),
          mint_a.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const pool_account_b = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-b"),
          poolAccount.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const trader_account_a = await getAssociatedTokenAddress(
        mint_a,
        pg.wallets.wallet4.publicKey
      );
      const trader_account_b = await getAssociatedTokenAddress(
        mint_b,
        pg.wallets.wallet4.publicKey
      );

      // Get initial balances
      const initialPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const initialPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const initialTraderA = (await getAccount(pg.program.provider.connection, trader_account_a)).amount;
      const initialTraderB = (await getAccount(pg.program.provider.connection, trader_account_b)).amount;

      const outputAmount = BigInt(100000);
      const swapA = true; // Swap B for A
      const inputAmount = (outputAmount * initialPoolB) / (initialPoolA - outputAmount);
      const feeAmount = (inputAmount * BigInt(fees)) / BigInt(PRECISION);
      const taxedInput = inputAmount + feeAmount;

      // Send transaction
      const txHash = await pg.program.methods
        .swapExactOutput(new BN(fees), swapA, new BN(outputAmount.toString()), new BN(10000000000000000), new BN(100))
        .accounts({
          amm: ammAccount,
          pool: poolAccount,
          trader: pg.wallets.wallet4.publicKey,
          mintA: mint_a,
          mintB: mint_b,
          poolAccountA: pool_account_a,
          poolAccountB: pool_account_b,
          traderAccountA: trader_account_a,
          traderAccountB: trader_account_b,
          tokenProgram: new web3.PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
          associatedTokenProgram: new web3.PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          ),
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pg.wallets.wallet4.keypair])
        .rpc();
      console.log(`swap exact output tx: => ${txHash}`);

      // Get final balances
      const finalPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const finalPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const finalTraderA = (await getAccount(pg.program.provider.connection, trader_account_a)).amount;
      const finalTraderB = (await getAccount(pg.program.provider.connection, trader_account_b)).amount;

      // Asserts
      assert.equal(finalPoolA, initialPoolA - outputAmount, "Pool A balance should decrease by outputAmount");
      assert.equal(finalPoolB, initialPoolB + taxedInput, "Pool B balance should increase by taxedInput");
      assert.equal(finalTraderA, initialTraderA + outputAmount, "Trader A balance should increase by outputAmount");
      assert.equal(finalTraderB, initialTraderB - taxedInput, "Trader B balance should decrease by taxedInput");
    } catch (error) {
      console.log(error);
    }
  });

  it("Withdraw liquidity", async () => {
    try {
      const fees = 10;
      const ammAccount = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("amm")],
        pg.PROGRAM_ID
      )[0];
      const mint_a = new web3.PublicKey(
        "Gvi3gqecizXrhEKpaqKPMz4VduHyu6KULTURKNq577AE"
      );
      const mint_b = new web3.PublicKey(
        "7UqEjPkUV3aL8aMJToVMGHXHXLAKotAgvTGQPJf72J3m"
      );
      const poolAccount = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool"),
          new BN(fees).toArrayLike(Buffer, "le", 8),
          ammAccount.toBuffer(),
          mint_a.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const pool_account_a = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-a"),
          poolAccount.toBuffer(),
          mint_a.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const pool_account_b = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-account-b"),
          poolAccount.toBuffer(),
          mint_b.toBuffer(),
        ],
        pg.PROGRAM_ID
      )[0];
      const depositor_account_a = await getAssociatedTokenAddress(
        mint_a,
        pg.wallets.wallet4.publicKey
      );
      const depositor_account_b = await getAssociatedTokenAddress(
        mint_b,
        pg.wallets.wallet4.publicKey
      );
      const mint_liquidity = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("liquidity"), poolAccount.toBuffer()],
        pg.PROGRAM_ID
      )[0];
      const depositor_account_liquidity = await getAssociatedTokenAddress(
        mint_liquidity,
        pg.wallets.wallet4.publicKey
      );

      // Get initial balances
      const initialPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const initialPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const initialDepositorA = (await getAccount(pg.program.provider.connection, depositor_account_a)).amount;
      const initialDepositorB = (await getAccount(pg.program.provider.connection, depositor_account_b)).amount;
      const initialMintSupply = (await getMint(pg.program.provider.connection, mint_liquidity)).supply;
      const initialDepositorLiquidity = (await getAccount(pg.program.provider.connection, depositor_account_liquidity)).amount;

      const liquidityAmount = BigInt(100000);

      // Compute expected amounts
      const amountA = (liquidityAmount * initialPoolA) / initialMintSupply;
      const amountB = (liquidityAmount * initialPoolB) / initialMintSupply;

      // Send transaction
      const txHash = await pg.program.methods
        .withdrawLiquidity(
          new BN(fees),
          new BN(liquidityAmount.toString()),
          new BN(amountA.toString()),
          new BN(amountB.toString())
        )
        .accounts({
          amm: ammAccount,
          pool: poolAccount,
          depositor: pg.wallets.wallet4.publicKey,
          mintA: mint_a,
          mintB: mint_b,
          poolAccountA: pool_account_a,
          poolAccountB: pool_account_b,
          mintLiquidity: mint_liquidity,
          depositorAccountA: depositor_account_a,
          depositorAccountB: depositor_account_b,
          depositorAccountLiquidity: depositor_account_liquidity,
          tokenProgram: new web3.PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
          associatedTokenProgram: new web3.PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          ),
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([pg.wallets.wallet4.keypair])
        .rpc();
      console.log(`withdraw liquidity transaction => ${txHash}`);

      // Get final balances
      const finalPoolA = (await getAccount(pg.program.provider.connection, pool_account_a)).amount;
      const finalPoolB = (await getAccount(pg.program.provider.connection, pool_account_b)).amount;
      const finalDepositorA = (await getAccount(pg.program.provider.connection, depositor_account_a)).amount;
      const finalDepositorB = (await getAccount(pg.program.provider.connection, depositor_account_b)).amount;
      const finalMintSupply = (await getMint(pg.program.provider.connection, mint_liquidity)).supply;
      const finalDepositorLiquidity = (await getAccount(pg.program.provider.connection, depositor_account_liquidity)).amount;

      // Asserts
      assert.equal(finalPoolA, initialPoolA - amountA, "Pool A balance should decrease by amountA");
      assert.equal(finalPoolB, initialPoolB - amountB, "Pool B balance should decrease by amountB");
      assert.equal(finalDepositorA, initialDepositorA + amountA, "Depositor A balance should increase by amountA");
      assert.equal(finalDepositorB, initialDepositorB + amountB, "Depositor B balance should increase by amountB");
      assert.equal(finalMintSupply, initialMintSupply - liquidityAmount, "Liquidity supply should decrease by liquidityAmount");
      assert.equal(finalDepositorLiquidity, initialDepositorLiquidity - liquidityAmount, "Depositor liquidity balance should decrease by liquidityAmount");
    } catch (error) {
      console.log(error);
    }
  });
});