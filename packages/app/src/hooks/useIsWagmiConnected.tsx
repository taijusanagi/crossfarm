import { useMemo } from "react";
import { useAccount } from "wagmi";

import { useIsMounted } from "./useIsMounted";

export const useIsWagmiConnected = () => {
  const { isConnected } = useAccount();
  const isMounted = useIsMounted();

  const isWagmiConnected = useMemo(() => {
    return isMounted && isConnected;
  }, [isMounted, isConnected]);

  return { isWagmiConnected };
};
