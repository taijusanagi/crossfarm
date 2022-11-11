import { useMemo } from "react";
import { useNetwork } from "wagmi";

import { isChainId } from "../../../contracts/types/ChainId";

export const useChainId = () => {
  const { chain } = useNetwork();
  const chainId = useMemo(() => {
    if (!chain) {
      return;
    }
    const chainId = String(chain.id);
    if (!isChainId(chainId)) {
      return;
    }
    return chainId;
  }, [chain]);
  return { chainId };
};
