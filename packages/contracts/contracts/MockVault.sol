// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20, ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {IBeefyVault} from "./interfaces/IBeefyVault.sol";

contract MockVault is IBeefyVault, ERC20 {
  address private _token;

  constructor(address token) ERC20("MockVault", "MV") {
    _token = token;
  }

  function deposit(uint256 _amount) public {
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    _mint(msg.sender, _amount);
  }

  function withdraw(uint256 _amount) public {
    _burn(msg.sender, _amount);
    ERC20(_token).transferFrom(address(this), msg.sender, _amount);
  }
}
