import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useChainId } from "@/hooks/useChainId";

import { useAddresses } from "./useAddresses";

export const useAccountTokenAmount = () => {
  const { chainId } = useChainId();
  const { address: userAddress } = useAccount();
  const addresses = useAddresses();
  const [isAccountTokenAmountLoading, setIsAccountTokenAmountLoading] = useState(false);
  const [isAccountStakedAmountLoading, setIsAccountStakedAmountLoading] = useState(false);

  const [accountTokenAmount, setAccountTokenAmount] = useState<number>();
  const [accountStakedAmount, setAccountStakedAmount] = useState<number>();

  const isAccountTokenAmountEnough = useMemo(() => {
    if (!accountTokenAmount) {
      return false;
    }
    return accountTokenAmount > 0;
  }, [accountTokenAmount]);

  const isAccountStakedAmountEnough = useMemo(() => {
    if (!accountStakedAmount) {
      return false;
    }
    return accountStakedAmount > 0;
  }, [accountStakedAmount]);

  const fetchAccountTokens = () => {
    if (!userAddress) {
      throw new Error("userAddress not defined");
    }
    if (!chainId) {
      throw new Error("chain not defined");
    }
    if (!addresses) {
      throw new Error("tokenAddress not defined");
    }
    setIsAccountTokenAmountLoading(true);
    setAccountTokenAmount(undefined);
    fetch(
      `${window.location.origin}/api/token?userAddress=${userAddress}&chainId=${chainId}&tokenAddress=${addresses.aUSDC}`
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

    fetch(
      `${window.location.origin}/api/token?userAddress=${userAddress}&chainId=${chainId}&tokenAddress=${addresses.vault}`
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const [token] = data;
        if (token) {
          setAccountStakedAmount(token.value);
        }
        setIsAccountStakedAmountLoading(false);
      });
  };
  return {
    accountTokenAmount,
    accountStakedAmount,
    isAccountTokenAmountLoading,
    isAccountStakedAmountLoading,
    isAccountTokenAmountEnough,
    isAccountStakedAmountEnough,
    fetchAccountTokens,
  };
};
