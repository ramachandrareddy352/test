"use client";

import React, { useRef, useState } from "react";
import { useDexProgram } from "./pool-mutation";
import { message, Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ConfirmedSignatureInfo, Keypair } from "@solana/web3.js";
import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  TransactionRequestURLFields,
} from "@solana/pay";
import { useConnection } from "@solana/wallet-adapter-react";

export function CreatePools() {
  const { connection } = useConnection();
  const [formData, setFormData] = useState({
    tokenA: "",
    tokenB: "",
    fee: 30,
  });
  const { createPoolMutation } = useDexProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tokenA.length != 44 || formData.tokenB.length != 44) {
      message.error("Enter valid length of token mints");
      return;
    } else {
      await createPoolMutation
        .mutateAsync({
          mintA: formData.tokenA,
          mintB: formData.tokenB,
          fees: formData.fee,
        })
        .then((data) => {
          console.log("Pool created successfully!");
          console.log("Response data:", data); // Log the returned data
          formData.tokenA = "";
          formData.tokenB = "";
          formData.fee = 30;
        });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? Number(value) : value, // Convert radio button value to a number
    }));
    if (type === "radio") {
      formData.fee = Number(value);
    }
  };

  // ----------- Solana Pay State -----------
  const qrRef = useRef<HTMLDivElement>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [showQR, setShowQR] = useState(false);
  // const [reference, setReference] = useState();

  const startPaymentTransfer = async () => {
    console.log("stage-1");

    setPaymentStatus("Preparing transaction...");

    try {
      setShowQR(true);
      // Set minLiquidity (adjust this based on your logic; 101 as a placeholder)
      const reference = new Keypair().publicKey;

      const params = new URLSearchParams();
      params.append("reference", reference.toString());
      params.append("mintA", formData.tokenA);
      params.append("mintB", formData.tokenB);
      params.append("fees", formData.fee.toString());

      const apiUrl = `${location.protocol}//${
        location.host
      }/api/create_pool?${params.toString()}`;
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

  return (
    <div className="container  py-3 text-white">
      <div className="bg-zinc-900 p-2 px-1 sm:p-4 sm:px-6 rounded-xl my-2 text-white mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Create Liquidity Pool</h1>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="tokenA"
                className="block text-sm font-medium my-3"
              >
                Mint-A Address
              </label>
              <input
                type="text"
                id="tokenA"
                name="tokenA"
                value={formData.tokenA}
                onChange={handleInputChange}
                placeholder="Enter ERC20 address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-[#212429]"
                required
              />
            </div>
            <br />

            <div>
              <label
                htmlFor="tokenB"
                className="block text-sm font-medium my-3"
              >
                Mint-B Address
              </label>
              <input
                type="text"
                id="tokenB"
                name="tokenB"
                value={formData.tokenB}
                onChange={handleInputChange}
                placeholder="Enter ERC20 address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-[#212429]"
                required
              />
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-grey-700 mb-2">
              Pool Fee
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {[10, 30, 100].map((fee) => (
                <div key={fee} className="relative">
                  <input
                    type="radio"
                    id={`fee-${fee}`}
                    name="fee" // Ensure the name matches the state key
                    value={fee}
                    checked={formData.fee === fee}
                    onChange={handleInputChange}
                    className="peer hidden"
                  />
                  <label
                    htmlFor={`fee-${fee}`}
                    className="flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer text-gray-700 bg-white hover:bg-gray-50 peer-checked:bg-indigo-50 peer-checked:border-indigo-600 peer-checked:text-indigo-600 transition-all"
                    style={{
                      backgroundColor: `${formData.fee === fee ? `grey` : ``}`,
                    }}
                  >
                    {fee / 100}&nbsp;%
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <p>
            <InfoCircleOutlined /> No two tokens can create multiple pools even
            having multiple fees.
          </p>

          {createPoolMutation.isPending ? (
            <div style={{ marginLeft: "45%" }}>
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
                onClick={handleSubmit}
              >
                Create Pool
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
        </form>
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
    </div>
  );
}
