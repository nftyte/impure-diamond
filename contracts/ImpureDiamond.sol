// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Diamond } from "./diamond/Diamond.sol";
import { ERC165Inclusions } from "./diamond/inclusions/ERC165Inclusions.sol";
import { OwnershipInclusions } from "./diamond/inclusions/OwnershipInclusions.sol";
import { DiamondLoupeInclusions } from "./diamond/inclusions/DiamondLoupeInclusions.sol";
import { DiamondCutInclusions } from "./diamond/inclusions/DiamondCutInclusions.sol";

contract ImpureDiamond is
    Diamond,
    DiamondCutInclusions,
    DiamondLoupeInclusions,
    OwnershipInclusions,
    ERC165Inclusions
{
    constructor(address _contractOwner) OwnershipInclusions(_contractOwner) {}
}
