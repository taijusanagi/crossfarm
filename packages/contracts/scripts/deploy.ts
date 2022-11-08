/* eslint-disable camelcase */
import fs from "fs";
import { ethers, network } from "hardhat";
import path from "path";

import axelar from "../axelar.json";
import { CrossFarm__factory, MockVaultFactory__factory } from "../typechain-types";
import { DeterministicDeployer } from "./helpers/DeterministicDeployer";

async function main() {
  if (
    network.name !== "ethereum" &&
    network.name !== "polygon" &&
    network.name !== "bnb" &&
    network.name !== "fantom"
  ) {
    throw new Error("network invalid");
  }

  const factoryAddress = await DeterministicDeployer.deploy(MockVaultFactory__factory.bytecode);
  const argument = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [axelar.testnet[network.name].gateway, axelar.testnet[network.name].gasService, factoryAddress]
  );
  const crossFarmCreationCode = ethers.utils.solidityPack(["bytes", "bytes"], [CrossFarm__factory.bytecode, argument]);
  const crossFarmAddress = await DeterministicDeployer.deploy(crossFarmCreationCode);

  const result = {
    crossFarm: crossFarmAddress,
  };
  fs.writeFileSync(path.join(__dirname, `../deployments.json`), JSON.stringify(result));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
