// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

import {IBeefyVault} from "./interfaces/IBeefyVault.sol";

contract CrossFarm is AxelarExecutable {
  IAxelarGasService public immutable gasReceiver;

  enum ProcessType {
    Plant,
    Harvest
  }

  constructor(address gateway_, address gasReceiver_) AxelarExecutable(gateway_) {
    gasReceiver = IAxelarGasService(gasReceiver_);
  }

  function process(
    ProcessType processType,
    string memory destinationChain,
    string memory destinationAddress,
    string memory tokenSymbol,
    uint256 tokenAmount,
    address vaultAddress
  ) external payable {
    address tokenAddress = gateway.tokenAddresses(tokenSymbol);
    bytes memory additinalData;
    if (processType == ProcessType.Plant) {
      IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
      additinalData = abi.encode(msg.sender, vaultAddress);
    } else {
      require(IBeefyVault(vaultAddress).token() == tokenAddress, "CrossFarm: invalid token vault address");
      IERC20(vaultAddress).transferFrom(msg.sender, address(this), tokenAmount);
      IBeefyVault(vaultAddress).withdraw(tokenAmount);
      additinalData = abi.encode(msg.sender);
    }
    IERC20(tokenAddress).approve(address(gateway), tokenAmount);
    bytes memory payload = abi.encode(processType, additinalData);
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
    uint256 tokenAmount
  ) internal virtual override {
    (ProcessType processType, bytes memory additinalData) = abi.decode(payload, (ProcessType, bytes));
    if (processType == ProcessType.Plant) {
      (address recipientAddress, address vaultAddress) = abi.decode(additinalData, (address, address));
      IBeefyVault(vaultAddress).deposit(tokenAmount);
      IERC20(vaultAddress).transferFrom(address(this), recipientAddress, tokenAmount);
    } else {
      address recipientAddress = abi.decode(additinalData, (address));
      address tokenAddress = gateway.tokenAddresses(tokenSymbol);
      IERC20(tokenAddress).transferFrom(address(this), recipientAddress, tokenAmount);
    }
  }
}
