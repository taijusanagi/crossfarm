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
  const crossFarm = await CrossFarm.deploy(
    networkJsonFile[chainId].axelar.gateway,
    networkJsonFile[chainId].axelar.gasService
  );
  await crossFarm.deployed();
  console.log("crossFarmAddress", crossFarm.address);
  networkJsonFile[chainId].deployments.crossFarm = crossFarm.address;
  const Vault = await ethers.getContractFactory("BeefyVault");
  const vault = await Vault.deploy(networkJsonFile[chainId].axelar.aUSDC);
  await vault.deployed();
  console.log("vaultAddress", vault.address);
  networkJsonFile[chainId].deployments.vault = vault.address;
  fs.writeFileSync(path.join(__dirname, `../network.json`), JSON.stringify(networkJsonFile));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
