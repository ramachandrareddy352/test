import {
  clusterApiUrl,
  PublicKey,
  Connection,
  Transaction,
  Keypair,
  TransactionInstruction,
} from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "js-sha256";
import BN from "bn.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getDexProgram } from "../../../../anchor/src";
import { AnchorProvider } from "@coral-xyz/anchor";
import MockWallet from "./MockWallet";

// Remove any client-only imports (like useWallet or React hooks)

const ENDPOINT = clusterApiUrl("devnet");

type Data = {
  label?: string;
  icon?: string;
  transaction?: string;
  message?: string;
};
export type PostError = {
  error: string;
};

const PROGRAM_ID = new PublicKey("AAwQy1UeenPqH6poqtiR6sKePDgeF2YcnHmy2jSNYRL6");
const DISCRIMINATOR = sha256.digest("global:increment").slice(0, 8);
const dataBuffer = Buffer.from([...DISCRIMINATOR]);

export async function GET(
  request: NextRequest,
  response: NextResponse<Data>
) {
  console.log(new URL(request.url));
  const label = "Solana Pay";
  const icon = "https://avatars.githubusercontent.com/u/92437260?v=4";

  return NextResponse.json({ label, icon }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();
    const { account } = body;

    const { searchParams } = new URL(request.url);
    const mintAPubkey = searchParams.get("mintA");
    const mintBPubkey = searchParams.get("mintB");
    const depositAmountA = searchParams.get("depositAmountA");
    const depositAmountB = searchParams.get("depositAmountB");
    const minLiquidity = searchParams.get("minLiquidity");
    const fees = searchParams.get("fees");
    const referenceParam = searchParams.get("reference");

    if (
      !account ||
      !mintAPubkey ||
      !mintBPubkey ||
      !depositAmountA ||
      !depositAmountB ||
      !minLiquidity ||
      !fees ||
      !referenceParam
    ) {
      throw new Error("Missing required fields in request parameters.");
    }

    const reference = new PublicKey(referenceParam);
    const depositor = new PublicKey(account);
    const mintA = new PublicKey(mintAPubkey);
    const mintB = new PublicKey(mintBPubkey);

    const depositAmountABN = new BN(depositAmountA);
    const depositAmountBBN = new BN(depositAmountB);
    const minLiquidityBN = new BN(minLiquidity);
    const feesBN = new BN(fees);

    // Derive PDAs
    const [amm] = PublicKey.findProgramAddressSync([Buffer.from("amm")], PROGRAM_ID);
    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), amm.toBuffer(), mintA.toBuffer(), mintB.toBuffer()],
      PROGRAM_ID
    );
    const [mintLiquidity] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity"), pool.toBuffer()],
      PROGRAM_ID
    );
    const [poolAccountA] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-account-a"), pool.toBuffer(), mintA.toBuffer()],
      PROGRAM_ID
    );
    const [poolAccountB] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-account-b"), pool.toBuffer(), mintB.toBuffer()],
      PROGRAM_ID
    );

    // User associated token accounts
    const depositorAccountA = await getAssociatedTokenAddress(mintA, depositor);
    const depositorAccountB = await getAssociatedTokenAddress(mintB, depositor);
    const depositorAccountLiquidity = await getAssociatedTokenAddress(mintLiquidity, depositor);

    const tokenProgram = new PublicKey(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    );
    const associatedTokenProgram = new PublicKey(
      "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
    );
    const systemProgram = new PublicKey("11111111111111111111111111111111");

    const instructionData = getInstructionData(
      depositAmountABN,
      depositAmountBBN,
      minLiquidityBN,
      feesBN,
      false // useEntireAmount (hardcoded to false)
    );

    // Set up a connection and load a server wallet from an environment variable.
    const connection = new Connection(ENDPOINT, "confirmed");
    // const secretKeyString = "4vERsJWbE3nGh2gPkCxx4TN6dfYVtvnGqyuX4WL3oNxC6s45gQboBikEEUfXkq5qySctJWjwZfjZdoVmPPqpo7Lc"; // Ensure this variable is set!
    // if (!secretKeyString) {
    //   throw new Error("Missing SERVER_WALLET environment variable.");
    // }
    // const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    // const walletKeypair = Keypair.fromSecretKey(secretKey);
    const wallet = MockWallet;

    // Create an Anchor provider (server-side)
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    // Get the program instance using your helper (ensure getDexProgram is server-compatible)
    const program = getDexProgram(provider);

    // Build the deposit liquidity instruction using Anchor's methods
    const depositIX = await program.methods
      .depositLiquidity(depositAmountABN, depositAmountBBN, minLiquidityBN, feesBN, true)
      .accounts({
        // @ts-ignore
        amm: amm,
        pool: pool,
        depositor: depositor,
        mintLiquidity: mintLiquidity,
        mintA: mintA,
        mintB: mintB,
        poolAccountA: poolAccountA,
        poolAccountB: poolAccountB,
        depositorAccountLiquidity: depositorAccountLiquidity,
        depositorAccountA: depositorAccountA,
        depositorAccountB: depositorAccountB,
        tokenProgram: tokenProgram,
        associatedTokenProgram: associatedTokenProgram,
        systemProgram: systemProgram,
      })
      .instruction();

    // Optionally add the reference account if needed:
    // depositIX.keys.push({
    //   pubkey: reference,
    //   isSigner: false,
    //   isWritable: false,
    // });

    // Build the transaction
    const transaction = new Transaction().add(depositIX);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = depositor;
    console.log("Transaction:", transaction);

    const serializedTransaction = transaction.serialize({
      // verifySignatures: false,
      requireAllSignatures: false,
    });
    const base64Transaction = serializedTransaction.toString("base64");
    console.log("Serialized Transaction (base64):", base64Transaction);

    return NextResponse.json(
      {
        transaction: base64Transaction,
        message: "Deposit liquidity transaction created successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

const getInstructionData = (
  depositAmountA: BN,
  depositAmountB: BN,
  minLiquidity: BN,
  fees: BN,
  useEntireAmount: boolean
): Buffer => {
  const discriminator = sha256.digest("global:deposit_liquidity").slice(0, 8);
  return Buffer.concat([
    Buffer.from(discriminator),
    depositAmountA.toArrayLike(Buffer, "le", 8),
    depositAmountB.toArrayLike(Buffer, "le", 8),
    minLiquidity.toArrayLike(Buffer, "le", 8),
    fees.toArrayLike(Buffer, "le", 8),
    Buffer.from([useEntireAmount ? 1 : 0]),
  ]);
};
