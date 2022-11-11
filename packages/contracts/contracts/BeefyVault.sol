// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20, IERC20Metadata, ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IBeefyVault} from "./interfaces/IBeefyVault.sol";

import "hardhat/console.sol";

contract BeefyVault is IBeefyVault, ERC20 {
  address public token;

  constructor(address token_) ERC20("BeefyVault", "BV") {
    token = token_;
  }

  function decimals() public view virtual override returns (uint8) {
    return IERC20Metadata(token).decimals();
  }

  function deposit(uint256 _amount) public {
    IERC20(token).transferFrom(msg.sender, address(this), _amount);
    _mint(msg.sender, _amount);
  }

  function withdraw(uint256 _amount) public {
    _burn(msg.sender, _amount);
    IERC20(token).transfer(msg.sender, _amount);
  }
}
