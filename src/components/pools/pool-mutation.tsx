"use client";

import { getDexProgram, getDexProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import BN from "bn.js";
import { message } from "antd";

export function useDexProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getDexProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getDexProgram(provider, programId),
    [provider, programId]
  );

  const poolAccounts = useQuery({
    queryKey: ["counter", "all", { cluster }],
    queryFn: () => program.account.pool.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createPoolMutation = useMutation({
    mutationKey: ["dex", "createPool", { cluster }],
    mutationFn: async ({
      mintA,
      mintB,
      fees,
    }: {
      mintA: string;
      mintB: string;
      fees: number;
    }) => {
      const mintAPubkey = new PublicKey(mintA);
      const mintBPubkey = new PublicKey(mintB);

      if (program.provider.publicKey) {
        const [ammAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("amm")],
          program.programId
        );
        console.log(ammAccount.toString());

        const [poolAccount] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("pool"),
            new BN(fees).toArrayLike(Buffer, "le", 8),
            ammAccount.toBuffer(),
            mintAPubkey.toBuffer(),
            mintBPubkey.toBuffer(),
          ],
          program.programId
        );
        console.log(poolAccount.toString());

        const [mintLiquidity] = PublicKey.findProgramAddressSync(
          [Buffer.from("liquidity"), poolAccount.toBuffer()],
          program.programId
        );
        console.log(mintLiquidity.toString());

        const [poolAccountA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("pool-account-a"),
            poolAccount.toBuffer(),
            mintAPubkey.toBuffer(),
          ],
          program.programId
        );
        console.log(poolAccountA.toString());

        const [poolAccountB] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("pool-account-b"),
            poolAccount.toBuffer(),
            mintBPubkey.toBuffer(),
          ],
          program.programId
        );
        console.log(poolAccountB.toString());
        console.log(fees);

        await program.methods
          .createPool(new BN(fees))
          .accounts({
            // @ts-ignore
            amm: ammAccount,
            pool: poolAccount,
            mintLiquidity: mintLiquidity,
            mintA: mintAPubkey,
            mintB: mintBPubkey,
            poolAccountA: poolAccountA,
            poolAccountB: poolAccountB,
            payer: provider.wallet.publicKey,
            tokenProgram: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
            associatedTokenProgram: new PublicKey(
              "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
            ),
            systemProgram: new PublicKey("11111111111111111111111111111111"), // System Program ID
          })
          .rpc();
      } else {
        message.error(`Connect the wallet`);
      }
    },
    onSuccess: (tx) => {
      console.log(tx);
      toast.success("Pool created successfully");
    },
    onError: (error) => {
      // toast.error(`Failed to create pool`);
      console.log(error);
    },
  });

  return {
    program,
    programId,
    poolAccounts,
    createPoolMutation,
    getProgramAccount,
  };
}
