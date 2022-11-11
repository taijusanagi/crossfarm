import { useMemo } from "react";

import networkJsonFile from "../../../contracts/network.json";
import { useChainId } from "./useChainId";

export const useAddresses = () => {
  const { chainId } = useChainId();
  const addresses = useMemo(() => {
    if (!chainId) {
      return;
    }
    const { aUSDC } = networkJsonFile[chainId].axelar;
    const { crossFarm, vault } = networkJsonFile[chainId].deployments;
    return {
      aUSDC,
      crossFarm,
      vault,
    };
  }, [chainId]);
  return addresses;
};
