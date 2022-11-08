// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Create2.sol";

import "./MockVault.sol";

// this is permission less contract
contract MockVaultFactory {
  // this should use clone proxy for better gas fee
  function deployVault(address token, uint256 salt) public returns (MockVault) {
    return new MockVault{salt: bytes32(salt)}(token);
  }

  function getCreate2Address(address token, uint256 salt) public view returns (address) {
    bytes memory creationCode = type(MockVault).creationCode;
    bytes memory initCode = abi.encodePacked(creationCode, abi.encode(token));
    bytes32 initCodeHash = keccak256(initCode);
    return Create2.computeAddress(bytes32(salt), initCodeHash, address(this));
  }
}
