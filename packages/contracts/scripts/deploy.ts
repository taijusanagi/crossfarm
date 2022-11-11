/* eslint-disable camelcase */
import fs from "fs";
import { ethers, network } from "hardhat";
import path from "path";

import networkJsonFile from "../network.json";
import { isChainId } from "../types/ChainId";

async function main() {
  const chainId = String(network.config.chainId);
  if (!isChainId(chainId)) {
    throw new Error("chainId invalid");
  }
  const CrossFarm = await ethers.getContractFactory("CrossFarm");
  const { address: crossFarmAddress } = await CrossFarm.deploy(
    networkJsonFile[chainId].axelar.gateway,
    networkJsonFile[chainId].axelar.gasService
  );
  console.log("crossFarmAddress", crossFarmAddress);
  networkJsonFile[chainId].deployments.crossFarm = crossFarmAddress;
  const Vault = await ethers.getContractFactory("MockVault");
  const { address: vaultAddress } = await Vault.deploy(networkJsonFile[chainId].axelar.aUSDC);
  console.log("vaultAddress", vaultAddress);
  networkJsonFile[chainId].deployments.vault = vaultAddress;
  fs.writeFileSync(path.join(__dirname, `../network.json`), JSON.stringify(networkJsonFile));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
