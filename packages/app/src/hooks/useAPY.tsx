import { useMemo } from "react";

import { getRandomNumber } from "@/lib/utils";

export const useAPY = () => {
  const apy = useMemo(() => {
    return {
      "5": `0.${getRandomNumber(0, 99)}`,
      "97": `0.${getRandomNumber(0, 99)}`,
      "4002": `0.${getRandomNumber(0, 99)}`,
      "80001": `0.${getRandomNumber(0, 99)}`,
    };
  }, []);
  return apy;
};
