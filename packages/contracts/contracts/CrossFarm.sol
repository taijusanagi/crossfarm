// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

import {MockVault} from "./MockVault.sol";

contract CrossFarm is AxelarExecutable {
  IAxelarGasService public immutable gasReceiver;

  constructor(address gateway_, address gasReceiver_) AxelarExecutable(gateway_) {
    gasReceiver = IAxelarGasService(gasReceiver_);
  }

  function xPlant(
    string memory destinationChain,
    string memory destinationAddress,
    string memory tokenSymbol,
    uint256 tokenAmount,
    address vaultAddress
  ) external payable {
    bytes memory payload = abi.encode(msg.sender, vaultAddress);
    if (msg.value > 0) {
      gasReceiver.payNativeGasForContractCall{value: msg.value}(
        address(this),
        destinationChain,
        destinationAddress,
        payload,
        msg.sender
      );
    }
    gateway.callContractWithToken(destinationChain, destinationAddress, payload, tokenSymbol, tokenAmount);
  }

  //TODO: implement callback for failed tx
  function _executeWithToken(
    string calldata sourceChain,
    string calldata sourceAddress,
    bytes calldata payload,
    string calldata tokenSymbol,
    uint256 amount
  ) internal virtual override {
    (address recipient, address vaultAddress) = abi.decode(payload, (address, address));
    address tokenAddress = gateway.tokenAddresses(tokenSymbol);
    IERC20(tokenAddress).approve(vaultAddress, amount);
    MockVault(vaultAddress).deposit(amount);
    IERC20(vaultAddress).transferFrom(address(this), recipient, amount);
  }
}
