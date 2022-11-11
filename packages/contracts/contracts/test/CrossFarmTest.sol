// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {CrossFarm} from "../CrossFarm.sol";

contract CrossFarmTest is CrossFarm {
  constructor(address gateway_, address gasReceiver_) CrossFarm(gateway_, gasReceiver_) {}

  function testExecuteWithToken(
    string calldata sourceChain,
    string calldata sourceAddress,
    bytes calldata payload,
    string calldata tokenSymbol,
    uint256 tokenAmount
  ) public {
    _executeWithToken(sourceChain, sourceAddress, payload, tokenSymbol, tokenAmount);
  }
}
