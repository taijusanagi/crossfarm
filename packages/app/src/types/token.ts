import Moralis from "moralis";

export const getNFTs = async (userAddress: string, chain: Chain): Promise<NFT[]> => {
  const options = { address: userAddress, chain };
  const { result } = await Moralis.Web3API.account.getNFTs(options);
  if (!result) {
    return [];
  }
  const nfts = result.map((nft) => {
    const metadata = {
      name: "",
      image: "",
    };
    if (nft.metadata) {
      const parsedMetadata = JSON.parse(nft.metadata);
      metadata.name = parsedMetadata.name || "";
      metadata.image = parsedMetadata.image || "";
    }
    return {
      nftContractAddress: nft.token_address,
      tokenId: nft.token_id,
      ...metadata,
    };
  });
  return nfts;
};
