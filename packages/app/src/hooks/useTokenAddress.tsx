import { useMemo } from "react";

import network from "../../../contracts/network.json";
import { useChainId } from "./useChainId";

export const useTokenAddress = () => {
  const { chainId } = useChainId();
  const tokenAddress = useMemo(() => {
    if (!chainId) {
      return;
    }
    return network[chainId].axelar.aUSDC;
  }, [chainId]);
  return { tokenAddress };
};
