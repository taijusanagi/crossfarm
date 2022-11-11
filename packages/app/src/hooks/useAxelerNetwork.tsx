import { EvmChain } from "@axelar-network/axelarjs-sdk";
import { useMemo } from "react";

import { useChainId } from "./useChainId";

export const useAxelarNetwork = () => {
  const { chainId } = useChainId();

  const axelarNetwork = useMemo(() => {
    return chainId === "5"
      ? EvmChain.ETHEREUM
      : chainId === "97"
      ? EvmChain.BINANCE
      : chainId === "4002"
      ? EvmChain.FANTOM
      : chainId === "80001"
      ? EvmChain.POLYGON
      : undefined;
  }, [chainId]);

  return { axelarNetwork };
};
