import Moralis from "moralis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userAddress, chainId, tokenAddress } = req.query;
  if (typeof userAddress !== "string") {
    throw new Error("userAddress invalid");
  }
  if (typeof chainId !== "string") {
    throw new Error("chainId invalid");
  }
  if (typeof tokenAddress !== "string") {
    throw new Error("tokenAddress invalid");
  }
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address: userAddress,
    chain: chainId,
    tokenAddresses: [tokenAddress],
  });
  const data = response.toJSON();
  res.status(200).json(data);
}
