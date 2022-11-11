import { useMemo } from "react";

import { getRandomNumber } from "@/lib/utils";

import networkJsonFile from "../../../contracts/network.json";

export const useAPY = () => {
  const apy = useMemo(() => {
    const result: { [key: string]: string } = {};
    Object.keys(networkJsonFile).forEach((chainId) => {
      result[chainId] = `0.${getRandomNumber(0, 99)}`;
    });
    return result;
  }, []);
  return apy;
};
