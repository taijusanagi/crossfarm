import { useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

import { useAddresses } from "./useAddresses";

export const useAccountTokenAmount = () => {
  const { chain } = useNetwork();
  const { address: userAddress } = useAccount();
  const addresses = useAddresses();
  const [isAccountTokenAmountLoading, setIsAccountTokenAmountLoading] = useState(false);
  const [accountTokenAmount, setAccountTokenAmount] = useState<number>();

  const isAccountTokenAmountEnough = useMemo(() => {
    if (!accountTokenAmount) {
      return false;
    }
    return accountTokenAmount > 0;
  }, [accountTokenAmount]);

  const fetchAccountTokenAmount = () => {
    if (!userAddress) {
      throw new Error("userAddress not defined");
    }
    if (!chain) {
      throw new Error("chain not defined");
    }
    if (!addresses) {
      throw new Error("tokenAddress not defined");
    }
    setIsAccountTokenAmountLoading(true);
    setAccountTokenAmount(undefined);
    fetch(
      `${window.location.origin}/api/token?userAddress=${userAddress}&chainId=${chain.id}&tokenAddress=${addresses.aUSDC}`
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const [token] = data;
        if (token) {
          setAccountTokenAmount(token.value);
        }
        setIsAccountTokenAmountLoading(false);
      });
  };
  return { accountTokenAmount, isAccountTokenAmountLoading, isAccountTokenAmountEnough, fetchAccountTokenAmount };
};
