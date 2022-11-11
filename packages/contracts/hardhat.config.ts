import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";

import * as dotenv from "dotenv";
import fs from "fs";
import { HardhatUserConfig } from "hardhat/config";

import networkJsonFile from "./network.json";

dotenv.config();

const mnemonicFileName = "../../mnemonic.txt";
let mnemonic = "test ".repeat(11) + "junk";
if (fs.existsSync(mnemonicFileName)) {
  mnemonic = fs.readFileSync("../../mnemonic.txt", "ascii").trim();
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
      },
      {
        version: "0.8.15",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic,
      },
    },
    ethereum: {
      chainId: 5,
      url: networkJsonFile["5"].rpc,
      accounts: {
        mnemonic,
      },
    },
    bnb: {
      chainId: 97,
      url: networkJsonFile["97"].rpc,
      accounts: {
        mnemonic,
      },
    },
    fantom: {
      chainId: 4002,
      url: networkJsonFile["4002"].rpc,
      accounts: {
        mnemonic,
      },
    },
    polygon: {
      chainId: 80001,
      url: networkJsonFile["80001"].rpc,
      accounts: {
        mnemonic,
      },
    },
  },
};

export default config;
