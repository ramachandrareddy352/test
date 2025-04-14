"use client";

import React, { useState, useEffect, useRef } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import { Modal, message, Image } from "antd";
import { useDexProgram } from "./data-mutaion";
import { ellipsify } from "../ui/ui-layout";
import { ConfirmedSignatureInfo, Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  TransactionRequestURLFields,
} from "@solana/pay";

type TokenData = {
  tokenMint: string;
  poolBalance: number;
  symbol: string;
  name: string;
};

const convertToBaseUnits = (amount: number, decimals: number): number => {
  return amount * 10 ** decimals;
};

export function RemoveLiquidity() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { program, poolAccounts, removeLiquidityMutation } = useDexProgram();

  const [tokenDataA, setTokenDataA] = useState<TokenData[]>([]);
  const [tokenDataB, setTokenDataB] = useState<TokenData[]>([]);
  const [isLoading, setLoading] = useState(false);
  const metaplex = Metaplex.make(connection);

  const [fees, setFees] = useState(30);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState(0);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [tokenOne, setTokenOne] = useState<TokenData>();
  const [tokenTwo, setTokenTwo] = useState<TokenData>();
  const [userOneBalance, setUserOneBalance] = useState(0);
  const [userTwoBalance, setUserTwoBalance] = useState(0);

  // ----------- Solana Pay State -----------
  const qrRef = useRef<HTMLDivElement>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [showQR, setShowQR] = useState(false);
  // const [reference, setReference] = useState();

  const startPaymentTransfer = async () => {
    console.log("stage-1");
    if (!publicKey) {
      message.error("Connect your wallet first");
      return;
    }
    if (!tokenOne || !tokenTwo || liquidityAmount === 0) {
      message.error("Please select both tokens and enter their amounts");
      return;
    }
    console.log("stage-1");

    setPaymentStatus("Preparing transaction...");

    try {
      setShowQR(true);
      // Set minLiquidity (adjust this based on your logic; 101 as a placeholder)
      const reference = new Keypair().publicKey;
      const tokenOneAmount = 1;
      const tokenTwoAmount = 1;

      const params = new URLSearchParams();
      params.append("reference", reference.toString());
      params.append("mintA", tokenOne.tokenMint);
      params.append("mintB", tokenTwo.tokenMint);
      params.append("minAmountA", tokenOneAmount.toString());
      params.append("minAmountB", tokenTwoAmount.toString());
      params.append("liquidityAmount", convertToBaseUnits(liquidityAmount, 6).toString());
      params.append("fees", fees.toString());

      const apiUrl = `${location.protocol}//${
        location.host
      }/api/withdraw_liquidity?${params.toString()}`;
      // Encode the API URL into a QR code
      const urlFields: TransactionRequestURLFields = {
        link: new URL(apiUrl),
      };
      console.log(apiUrl);

      const url = encodeURL(urlFields);
      const qr = createQR(url, 250, "white", "black");
      console.log(url);

      console.log("showing qr");
      console.log(qrRef.current);
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
        qr.append(qrRef.current);
        console.log("appended");
      } else {
        return;
      }
      setPaymentStatus("Pending...");
      console.log("\n5. Find the transaction");

      const signatureInfo: ConfirmedSignatureInfo = await new Promise(
        (resolve, reject) => {
          // Start checking every 2 seconds
          const intervalId = setInterval(async () => {
            console.count("Checking for transaction...");
            try {
              const result = await findReference(connection, reference, {
                finality: "confirmed",
              });
              // Transaction found, stop further checks.
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              console.log("\n 🖌  Signature found: ", result.signature);
              resolve(result);
            } catch (error: any) {
              if (!(error instanceof FindReferenceError)) {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                reject(error);
              }
            }
          }, 2000);

          // Set a timeout to stop checking after 2 minutes
          const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            console.log("❌ Payment timeout reached.");
            setPaymentStatus("Timeout Reached");
            reject(new Error("Payment timeout reached"));
          }, 2 * 60 * 1000); // 2 minutes timeout
        }
      );

      setShowQR(false);
      let { signature } = signatureInfo;
      setPaymentStatus("Confirmed");
      const transaction = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      console.log(transaction);
      if (!transaction || !transaction.meta) {
        console.error("Transaction not found or incomplete");
        return false;
      }
      if (transaction.meta.err) {
        console.error("Transaction failed with error:", transaction.meta.err);
        return false;
      }
    } catch (error: any) {
      console.error("Error starting payment transfer:", error);
      message.error(error.message);
      setShowQR(false);
    }
  };

  // ----------- End Solana Pay code -----------

  const withdrawLiquidity = async () => {
    if (
      liquidityAmount != 0 &&
      tokenOne?.tokenMint &&
      tokenTwo?.tokenMint &&
      publicKey
    ) {
      await removeLiquidityMutation
        .mutateAsync({
          mintA: tokenOne?.tokenMint,
          mintB: tokenTwo?.tokenMint,
          fees: fees,
          liquidity: convertToBaseUnits(liquidityAmount, 6),
        })
        .then((data) => {
          console.log("Liquidity Withdraw successfully!");
          console.log("Response data:", data); // Log the returned data
        });

      const ATAOne = await getAssociatedTokenAddress(
        new PublicKey(tokenOne.tokenMint),
        program.provider.publicKey || new PublicKey("")
      );
      try {
        const tokenAccount = await connection.getTokenAccountBalance(ATAOne);
        setUserOneBalance(tokenAccount.value.uiAmount || 0);
      } catch (error) {
        setUserOneBalance(0);
      }
      const ATATwo = await getAssociatedTokenAddress(
        new PublicKey(tokenTwo.tokenMint),
        program.provider.publicKey || new PublicKey("")
      );
      try {
        const tokenAccount = await connection.getTokenAccountBalance(ATATwo);
        setUserTwoBalance(tokenAccount.value.uiAmount || 0);
      } catch (error) {
        setUserTwoBalance(0);
      }
    } else {
      message.error("Please select both tokens and enter the amount");
    }
  };

  function openModal(asset: number) {
    setChangeToken(asset);
    if (asset == 1) {
      setIsOpen1(true);
    } else {
      setIsOpen2(true);
    }
  }

  async function modifyToken(i: number) {
    if (publicKey) {
      if (changeToken === 1) {
        const token = tokenDataA[i];
        const ATA = await getAssociatedTokenAddress(
          new PublicKey(token.tokenMint),
          publicKey
        );
        try {
          const tokenAccount = await connection.getTokenAccountBalance(ATA);
          setUserOneBalance(tokenAccount.value.uiAmount || 0);
        } catch (error) {
          setUserOneBalance(0);
        }
        setTokenOne(token);
        setIsOpen1(false);
      } else {
        const token = tokenDataB[i];
        const ATA = await getAssociatedTokenAddress(
          new PublicKey(token.tokenMint),
          publicKey
        );
        try {
          const tokenAccount = await connection.getTokenAccountBalance(ATA);
          setUserTwoBalance(tokenAccount.value.uiAmount || 0);
        } catch (error) {
          setUserTwoBalance(0);
        }
        setTokenTwo(token);
        setIsOpen2(false);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!poolAccounts.isLoading && poolAccounts.data) {
        const dataA: TokenData[] = [];
        const dataB: TokenData[] = [];
        const uniqueMintsA = new Set<string>();
        const uniqueMintsB = new Set<string>();

        for (const pool of poolAccounts.data) {
          try {
            const mintA = pool.account.mintA.toString();
            if (!uniqueMintsA.has(mintA)) {
              const balanceA = await connection.getTokenAccountBalance(
                pool.account.poolAccountA
              );
              const tokenAmountA = balanceA.value.uiAmount || 0;
              let symbolA = "NULL";
              let nameA = "UnKnown";
              const metadataAccountA = metaplex
                .nfts()
                .pdas()
                .metadata({ mint: pool.account.mintA });
              const metadataAccountInfoA = await connection.getAccountInfo(
                metadataAccountA
              );
              if (metadataAccountInfoA) {
                const tokenA = await metaplex
                  .nfts()
                  .findByMint({ mintAddress: pool.account.mintA });
                symbolA = tokenA.symbol;
                nameA = tokenA.name;
              }
              uniqueMintsA.add(mintA);
              dataA.push({
                tokenMint: mintA,
                poolBalance: tokenAmountA,
                symbol: symbolA,
                name: nameA,
              });
              console.log(dataA);
            }

            const mintB = pool.account.mintB.toString();
            if (!uniqueMintsB.has(mintB)) {
              const balanceB = await connection.getTokenAccountBalance(
                pool.account.poolAccountB
              );
              const tokenAmountB = balanceB.value.uiAmount || 0;
              let symbolB = "NULL";
              let nameB = "UnKnown";
              const metadataAccountB = metaplex
                .nfts()
                .pdas()
                .metadata({ mint: pool.account.mintB });
              const metadataAccountInfoB = await connection.getAccountInfo(
                metadataAccountB
              );
              if (metadataAccountInfoB) {
                const tokenB = await metaplex
                  .nfts()
                  .findByMint({ mintAddress: pool.account.mintB });
                symbolB = tokenB.symbol;
              }
              uniqueMintsB.add(mintB);
              dataB.push({
                tokenMint: mintB,
                poolBalance: tokenAmountB,
                symbol: symbolB,
                name: nameB,
              });
              console.log(dataB);
            }
          } catch (error) {
            console.error("Error fetching pool data:", error);
          }
        }

        setTokenDataA(dataA);
        setTokenDataB(dataB);
        console.log(tokenDataA);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-zinc-900 p-2 px-1 sm:p-4 sm:px-6 rounded-xl my-2 text-white mx-auto">
      <Modal
        open={isOpen1}
        footer={null}
        onCancel={() => setIsOpen1(false)}
        title="Select a token"
        width="90%"
        className="max-w-[500px]"
      >
        <div className="modalContent overflow-x-scroll">
          {tokenDataA?.map((token: TokenData, i: any) => {
            return (
              <div
                className="tokenChoice flex"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <div>
                  <Image
                    src="/token.webp"
                    alt={token.name}
                    className="tokenLogo"
                    width={50}
                    height={50}
                    style={{ float: "left" }}
                  />
                </div>
                <div
                  className="tokenChoiceNames px-5"
                  style={{ cursor: "pointer" }}
                >
                  <div className="tokenName">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="tokenTicker">{token.tokenMint}</div>
                  <br />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={isOpen2}
        footer={null}
        onCancel={() => setIsOpen2(false)}
        title="Select a token"
        width="90%"
        className="max-w-[500px]"
      >
        <div className="modalContent overflow-x-scroll">
          {tokenDataB?.map((token: TokenData, i: any) => {
            return (
              <div
                className="tokenChoice flex"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <div>
                  <Image
                    src="/token.webp"
                    alt={token.name}
                    className="tokenLogo"
                    width={50}
                    height={50}
                    style={{ float: "left" }}
                  />
                </div>
                <div
                  className="tokenChoiceNames px-5"
                  style={{ cursor: "pointer" }}
                >
                  <div className="tokenName">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="tokenTicker">{token.tokenMint}</div>
                  <br />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {!isLoading ? (
        <div>
          <div className="relative bg-[#212429] p-4 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600 md:flex md:flex-row md:justify-between">
            <div className="flex justify-between mb-2 items-center flex-col ">
              <p>Mint-A </p>
              <div className="flex p-2 pr-5 pl-3 bg-black rounded-[20px] cursor-pointer w-full justify-center">
                <div
                  className="assetOne pb-1 w-max"
                  onClick={() => openModal(1)}
                >
                  <Image
                    src="/token.webp"
                    alt="assetOneLogo"
                    className="assetLogo"
                    width={30}
                    height={30}
                    style={{ float: "left", marginTop: "5px" }}
                  />
                  <b
                    style={{
                      fontSize: "20px",
                      marginLeft: "10px",
                    }}
                  >
                    {ellipsify(tokenOne?.tokenMint, 4)}
                  </b>
                  &nbsp;&nbsp;
                  <DownOutlined />
                </div>
              </div>
              <p className="mx-3">Balance: {userOneBalance}</p>
            </div>

            <div className="flex justify-between mb-2 items-center flex-col ">
              <p>Mint-B </p>
              <div className="flex p-2 pr-5 pl-3 bg-black rounded-[20px] cursor-pointer w-full justify-center">
                <div
                  className="assetOne pb-1 w-max"
                  onClick={() => openModal(2)}
                >
                  <Image
                    src="/token.webp"
                    alt="assetOneLogo"
                    className="assetLogo"
                    width={30}
                    height={30}
                    style={{ float: "left", marginTop: "5px" }}
                  />
                  <b
                    style={{
                      fontSize: "20px",
                      marginLeft: "10px",
                    }}
                  >
                    {ellipsify(tokenTwo?.tokenMint, 4)}
                  </b>
                  &nbsp;&nbsp;
                  <DownOutlined />
                </div>
              </div>
              <p className="mx-3">Balance: {userTwoBalance}</p>
            </div>
          </div>

          <br />

          <fieldset>
            <legend className="text-sm font-medium text-grey-700 mb-2">
              Pool Fee
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {[10, 30, 100].map((fee: number) => (
                <div key={fee} className="relative">
                  <input
                    type="radio"
                    id={`fee-${fee}`}
                    name="fee"
                    value={fee}
                    checked={fees === fee}
                    onChange={() => setFees(fee)}
                    className="peer hidden"
                  />
                  <label
                    htmlFor={`fee-${fee}`}
                    className="flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer text-gray-700 bg-white hover:bg-gray-50 peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600 transition-all"
                    style={{
                      backgroundColor: `${fees === fee ? `grey` : ``}`,
                    }}
                  >
                    {fee / 100}&nbsp;%
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <br />
          <p>
            <InfoCircleOutlined /> If the selected pool with fees is not exists,
            then transition will revert
          </p>
          <br />
          <div>
            <h5>Enter Liquidity : </h5>
            <input
              className=" w-full outline-none h-8 px-2 mt-3 appearance-none text-3xl bg-[#212429]"
              style={{
                height: "50px",
                borderRadius: "15px",
                textAlign: "center",
              }}
              type="number"
              onChange={(e) => setLiquidityAmount(parseFloat(e.target.value))}
              value={liquidityAmount}
              placeholder={"0.0"}
            />
          </div>

          <div>
            {removeLiquidityMutation.isPending ? (
              <div className="my-5" style={{ marginLeft: "45%" }}>
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className="flex btn btn-outline-primary my-5"
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "20px",
                  }}
                  onClick={withdrawLiquidity}
                >
                  Withdraw Liquidity
                </button>
                <button
                  type="button"
                  className="flex btn btn-outline-primary my-5"
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "20px",
                  }}
                  onClick={startPaymentTransfer}
                >
                  Use Scanner (Solana Pay)
                </button>
              </div>
            )}
          </div>
          <Modal
            open={showQR}
            footer={null}
            onCancel={() => setShowQR(false)}
            title="Scan QR Code to Confirm Withdraw"
            width="90%"
            className="max-w-[300px]"
          >
            <div className="modalContent ">
              <div ref={qrRef} />
              <p>
                Status: <strong>{paymentStatus}</strong>
              </p>
            </div>
          </Modal>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: "470px" }}
        >
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
    </div>
  );
}
