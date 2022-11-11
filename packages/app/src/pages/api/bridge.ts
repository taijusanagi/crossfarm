import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

import { axeler } from "@/lib/axeler";

import networkJsonFile from "../../../../contracts/network.json";
import { isChainId } from "../../../../contracts/types/ChainId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, txHash } = req.query;

  if (typeof chainId !== "string" || !isChainId(chainId)) {
    throw new Error("chainId invalid");
  }

  if (typeof txHash !== "string") {
    throw new Error("txHash invalid");
  }

  const provider = new ethers.providers.JsonRpcProvider(networkJsonFile[chainId].rpc);

  const senderOptions = { privateKey: process.env.PRIVATE_KEY, provider };
  const manualRelayToDestChainResponse = await axeler.recovery.manualRelayToDestChain(txHash, senderOptions);
  console.log("manualRelayToDestChainResponse", manualRelayToDestChainResponse);

  const executeResponse = await axeler.recovery.execute(txHash);
  console.log("executeResponse", executeResponse);
  res.status(200).json("ok");
}
