import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

import { AssetSymbol } from "../lib/axeler";
import networkJsonFile from "../network.json";
import { ChainId, isChainId } from "../types/ChainId";

describe("Integration", function () {
  async function fixture() {
    const [signer] = await ethers.getSigners();
    const sourceChainId = String(network.config.chainId);
    if (!isChainId(sourceChainId)) {
      throw new Error("chainId invalid");
    }
    const selectedChainId: ChainId = "80001";
    const USDC = await ethers.getContractFactory("ERC20");
    const usdc = USDC.attach(networkJsonFile[sourceChainId].axelar.aUSDC);
    const Vault = await ethers.getContractFactory("BeefyVault");
    const vault = await Vault.deploy(usdc.address);
    const CrossFarm = await ethers.getContractFactory("CrossFarm");
    const crossFarm = await CrossFarm.deploy(
      networkJsonFile[sourceChainId].axelar.gateway,
      networkJsonFile[sourceChainId].axelar.gasService
    );
    return { signer, sourceChainId, selectedChainId, usdc, vault, crossFarm };
  }

  it("deployments", async function () {
    const { sourceChainId, usdc, vault, crossFarm } = await loadFixture(fixture);
    expect(await usdc.name()).to.equal("Axelar Wrapped aUSDC");
    expect(await vault.name()).to.equal("BeefyVault");
    expect(await crossFarm.gasReceiver()).to.equal(networkJsonFile[sourceChainId].axelar.gasService);
  });

  it("plant", async function () {
    const { selectedChainId, usdc, vault, crossFarm } = await loadFixture(fixture);
    const amount = ethers.utils.parseUnits("0.1", 6);
    await usdc.approve(crossFarm.address, amount);
    await crossFarm.process(
      "0",
      networkJsonFile[selectedChainId].key,
      networkJsonFile[selectedChainId].deployments.crossFarm,
      AssetSymbol,
      amount,
      vault.address // dummy
    );
  });

  it("harvest", async function () {
    const { selectedChainId, usdc, vault, crossFarm } = await loadFixture(fixture);
    const amount = ethers.utils.parseUnits("0.1", 6);
    await usdc.approve(vault.address, amount);
    await vault.deposit(amount);
    await vault.approve(crossFarm.address, amount);
    await crossFarm.process(
      "1",
      networkJsonFile[selectedChainId].key,
      networkJsonFile[selectedChainId].deployments.crossFarm,
      AssetSymbol,
      amount,
      vault.address
    );
  });
});
