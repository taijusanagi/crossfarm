import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Chain, chain, configureChains, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import networkJsonFile from "../../../../contracts/network.json";
import { ChainId } from "../../../../contracts/types/ChainId";

const customChainIds: ChainId[] = ["97", "4002"];
const [bnbChain, ftmChain] = customChainIds.map((chainId) => {
  return {
    id: Number(chainId),
    name: networkJsonFile[chainId].name,
    network: networkJsonFile[chainId].key,
    nativeCurrency: {
      decimals: 18,
      name: networkJsonFile[chainId].currency,
      symbol: networkJsonFile[chainId].currency,
    },
    rpcUrls: {
      default: networkJsonFile[chainId].rpc,
    },
    blockExplorers: {
      default: { name: networkJsonFile[chainId].explorer.name, url: networkJsonFile[chainId].explorer.url },
    },
    testnet: true,
  };
});

const { chains, provider } = configureChains(
  [chain.goerli, chain.polygonMumbai, bnbChain, ftmChain],
  [publicProvider()]
);

export interface RainbowWeb3AuthConnectorProps {
  chains: Chain[];
}

const { connectors } = getDefaultWallets({
  appName: "crossfarm",
  chains,
});

export { chains };

export const wagmiClient = createClient({
  connectors,
  provider,
});
