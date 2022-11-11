import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

import { assetSymbol } from "../lib/axeler";
import networkJsonFile from "../network.json";
import { ChainId, isChainId } from "../types/ChainId";

describe("integration", function () {
  async function fixture() {
    const [signer] = await ethers.getSigners();
    const runningEnvironmentChainId = String(network.config.chainId);
    if (!isChainId(runningEnvironmentChainId)) {
      throw new Error("chainId invalid");
    }
    const oppositeChainId: ChainId = "80001";
    const USDC = await ethers.getContractFactory("ERC20");
    const usdc = USDC.attach(networkJsonFile[runningEnvironmentChainId].axelar.aUSDC);
    const Vault = await ethers.getContractFactory("BeefyVault");
    const vault = await Vault.deploy(usdc.address);
    const CrossFarm = await ethers.getContractFactory("CrossFarmTest");
    const crossFarm = await CrossFarm.deploy(
      networkJsonFile[runningEnvironmentChainId].axelar.gateway,
      networkJsonFile[runningEnvironmentChainId].axelar.gasService
    );

    const amount = ethers.utils.parseUnits("0.1", 6);
    return { signer, runningEnvironmentChainId, oppositeChainId, usdc, vault, crossFarm, amount };
  }

  it("deployments", async function () {
    const { runningEnvironmentChainId, usdc, vault, crossFarm } = await loadFixture(fixture);
    expect(await usdc.name()).to.equal("Axelar Wrapped aUSDC");
    expect(await vault.name()).to.equal("BeefyVault");
    expect(await crossFarm.gasReceiver()).to.equal(networkJsonFile[runningEnvironmentChainId].axelar.gasService);
  });

  describe("send", function () {
    it("plant", async function () {
      const { oppositeChainId, usdc, vault, crossFarm, amount } = await loadFixture(fixture);
      await usdc.approve(crossFarm.address, amount);
      await crossFarm.process(
        "0",
        networkJsonFile[oppositeChainId].key,
        networkJsonFile[oppositeChainId].deployments.crossFarm,
        assetSymbol,
        amount,
        vault.address // dummy
      );
    });

    it("harvest", async function () {
      const { oppositeChainId, usdc, vault, crossFarm, amount } = await loadFixture(fixture);
      await usdc.approve(vault.address, amount);
      await vault.deposit(amount);
      await vault.approve(crossFarm.address, amount);
      await crossFarm.process(
        "1",
        networkJsonFile[oppositeChainId].key,
        networkJsonFile[oppositeChainId].deployments.crossFarm,
        assetSymbol,
        amount,
        vault.address
      );
    });
  });

  describe("receive", function () {
    it("plant", async function () {
      const { signer, usdc, vault, crossFarm, amount } = await loadFixture(fixture);
      await usdc.transfer(crossFarm.address, amount);
      const additionalData = ethers.utils.defaultAbiCoder.encode(
        ["address", "address"],
        [signer.address, vault.address]
      );
      const payload = ethers.utils.defaultAbiCoder.encode(["uint8", "bytes"], ["0", additionalData]);
      await crossFarm.testExecuteWithToken("", "", payload, assetSymbol, amount);
    });

    it("harvest", async function () {
      const { signer, usdc, crossFarm, amount } = await loadFixture(fixture);
      await usdc.transfer(crossFarm.address, amount);
      const additionalData = ethers.utils.defaultAbiCoder.encode(["address"], [signer.address]);
      const payload = ethers.utils.defaultAbiCoder.encode(["uint8", "bytes"], ["1", additionalData]);
      await crossFarm.testExecuteWithToken("", "", payload, assetSymbol, amount);
    });
  });
});
