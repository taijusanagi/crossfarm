import { ethers } from "ethers";
import Moralis from "moralis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  if (typeof address !== "string" || !ethers.utils.isAddress(address)) {
    return res.status(400).json({ error: "query user address is invalid" });
  }
  const { data } = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain: "5",
    tokenAddresses: ["0x254d06f33bdc5b8ee05b2ea472107e300226659a"],
  });
  res.status(200).json(data);
}
