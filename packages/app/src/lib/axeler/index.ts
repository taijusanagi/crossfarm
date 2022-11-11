import { AxelarGMPRecoveryAPI, AxelarQueryAPI, Environment, EvmChain, GasToken } from "@axelar-network/axelarjs-sdk";

import { ChainId } from "../../../../contracts/types/ChainId";

export const axeler = {
  query: new AxelarQueryAPI({
    environment: Environment.TESTNET,
  }),
  recovery: new AxelarGMPRecoveryAPI({
    environment: Environment.TESTNET,
  }),
};

export const getAxelerNetwork = (chainId: ChainId) => {
  return chainId === "5"
    ? EvmChain.ETHEREUM
    : chainId === "97"
    ? EvmChain.BINANCE
    : chainId === "4002"
    ? EvmChain.FANTOM
    : EvmChain.POLYGON;
};

export const getAxelerToken = (chainId: ChainId) => {
  return chainId === "5"
    ? GasToken.ETH
    : chainId === "97"
    ? GasToken.BINANCE
    : chainId === "4002"
    ? GasToken.FTM
    : GasToken.MATIC;
};
