/* eslint-disable camelcase */
import { useMemo } from "react";
import { useSigner } from "wagmi";

import { BeefyVault__factory, CrossFarm__factory, ERC20__factory } from "../../../contracts/typechain-types";
import { useAddresses } from "./useAddresses";

export const useContracts = () => {
  const addresses = useAddresses();
  const { data: signer } = useSigner();
  const contracts = useMemo(() => {
    if (!addresses || !signer) {
      return;
    }
    const crossFarm = CrossFarm__factory.connect(addresses.crossFarm, signer);
    const vault = BeefyVault__factory.connect(addresses.vault, signer);
    const token = ERC20__factory.connect(addresses.aUSDC, signer);

    return { crossFarm, vault, token };
  }, [addresses, signer]);
  return contracts;
};
