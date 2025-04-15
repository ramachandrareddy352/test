import {
  clusterApiUrl,
  PublicKey,
  Connection,
  Transaction,
} from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import BN from "bn.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getDexProgram } from "../../../../anchor/src";
import { AnchorProvider } from "@coral-xyz/anchor";
import MockWallet from "../MockWallet";

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

const PROGRAM_ID = new PublicKey(
  "FAoQiEDBmQW7aPNwcsdp988aoDNSwSbxfxSMKxaqSEhY"
);

export async function GET(request: NextRequest, response: NextResponse<Data>) {
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
    const swapA = searchParams.get("swapA");
    const inputAmount = searchParams.get("inputAmount");
    const minOutputAmount = searchParams.get("minOutputAmount");
    const deltaPriceChange = searchParams.get("deltaPriceChange");
    const fees = searchParams.get("fees");
    const referenceParam = searchParams.get("reference");

    if (
      !account ||
      !mintAPubkey ||
      !mintBPubkey ||
      !inputAmount ||
      !minOutputAmount ||
      !deltaPriceChange ||
      !fees ||
      !referenceParam
    ) {
      throw new Error("Missing required fields in request parameters.");
    }

    const reference = new PublicKey(referenceParam);
    const depositor = new PublicKey(account);
    const mintA = new PublicKey(mintAPubkey);
    const mintB = new PublicKey(mintBPubkey);

    const inputAmountBN = new BN(inputAmount);
    const minOutputAmountBN = new BN(minOutputAmount);
    const deltaPriceChangeBN = new BN(deltaPriceChange);
    const feesBN = new BN(fees);

    // Derive PDAs
    const [amm] = PublicKey.findProgramAddressSync(
      [Buffer.from("amm")],
      PROGRAM_ID
    );
    const [pool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        new BN(fees).toArrayLike(Buffer, "le", 8),
        amm.toBuffer(),
        mintA.toBuffer(),
        mintB.toBuffer(),
      ],
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
    console.log(
      amm + "---" + pool + "---" + poolAccountA + "---" + poolAccountB
    );
    // User associated token accounts
    const depositorAccountA = await getAssociatedTokenAddress(mintA, depositor);
    const depositorAccountB = await getAssociatedTokenAddress(mintB, depositor);

    const tokenProgram = new PublicKey(
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    );
    const associatedTokenProgram = new PublicKey(
      "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
    );
    const systemProgram = new PublicKey("11111111111111111111111111111111");

    // Set up a connection and load a server wallet from an environment variable.
    const connection = new Connection(ENDPOINT, "confirmed");
    const wallet = MockWallet;

    // Create an Anchor provider (server-side)
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    // Get the program instance using your helper (ensure getDexProgram is server-compatible)
    const program = getDexProgram(provider);

    // Build the deposit liquidity instruction using Anchor's methods
    const depositIX = await program.methods
      .swapExactInput(
        feesBN,
        swapA === "true" ? true : false,
        inputAmountBN,
        minOutputAmountBN,
        deltaPriceChangeBN
      )
      .accounts({
        // @ts-ignore
        amm: amm,
        pool: pool,
        trader: depositor,
        mintA: mintA,
        mintB: mintB,
        poolAccountA: poolAccountA,
        poolAccountB: poolAccountB,
        traderAccountA: depositorAccountA,
        traderAccountB: depositorAccountB,
        tokenProgram: tokenProgram,
        associatedTokenProgram: associatedTokenProgram,
        systemProgram: systemProgram,
      })
      .instruction();

    // Optionally add the reference account if needed:
    depositIX.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });

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
