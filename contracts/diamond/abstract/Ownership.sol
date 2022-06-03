// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IERC173 } from "../interfaces/IERC173.sol";

abstract contract Ownership is IERC173 {
    function transferOwnership(address _newOwner) external virtual override;

    function owner() external view virtual override returns (address owner_);
}
