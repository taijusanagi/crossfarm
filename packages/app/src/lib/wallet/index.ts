import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Chain, chain, configureChains, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains([chain.polygonMumbai], [publicProvider()]);

export interface RainbowWeb3AuthConnectorProps {
  chains: Chain[];
}

const { connectors } = getDefaultWallets({
  appName: "crossfarm",
  chains,
});

export { chains };

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
