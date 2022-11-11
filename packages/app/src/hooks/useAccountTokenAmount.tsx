import { useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

import { useTokenAddress } from "./useTokenAddress";

export const useAccountTokenAmount = () => {
  const { chain } = useNetwork();
  const { address: userAddress } = useAccount();
  const { tokenAddress } = useTokenAddress();
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
    if (!tokenAddress) {
      throw new Error("tokenAddress not defined");
    }
    setIsAccountTokenAmountLoading(true);
    setAccountTokenAmount(undefined);
    fetch(
      `${window.location.origin}/api/token?userAddress=${userAddress}&chainId=${chain.id}&tokenAddress=${tokenAddress}`
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
