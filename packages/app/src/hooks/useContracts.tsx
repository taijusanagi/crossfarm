/* eslint-disable camelcase */
import { useMemo } from "react";
import { useSigner } from "wagmi";

import { CrossFarm__factory, MockVault__factory } from "../../../contracts/typechain-types";
import { useAddresses } from "./useAddresses";

export const useContracts = () => {
  const addresses = useAddresses();
  const { data: signer } = useSigner();
  const contracts = useMemo(() => {
    if (!addresses || !signer) {
      return;
    }
    const crossFarm = CrossFarm__factory.connect(addresses.crossFarm, signer);
    const vault = MockVault__factory.connect(addresses.vault, signer);
    return { crossFarm, vault };
  }, [addresses, signer]);
  return contracts;
};