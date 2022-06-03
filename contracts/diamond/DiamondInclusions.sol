// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibDiamond } from "./libraries/LibDiamond.sol";

contract DiamondInclusions {
    function inclusionCall() internal virtual returns (bool success_, bytes memory result_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        address facet = ds.selectorInfo[msg.sig].facetAddress;

        require(facet != address(0), "Diamond: Function does not exist");

        if (facet != address(this)) {
            (success_, result_) = facet.delegatecall(msg.data);

            if (!success_) {
                if (result_.length > 0) {
                    revert(string(result_));
                } else {
                    revert("DiamondInclusions: Facet function reverted");
                }
            }
        }
    }

    function boolInclusionCall() internal virtual returns(bool success_, bool result_) {
        (bool success, bytes memory result) = inclusionCall();
        if (success) {
            return (true, abi.decode(result, (bool)));
        }
    }
    
    function addressInclusionCall() internal virtual returns(bool success_, address result_) {
        (bool success, bytes memory result) = inclusionCall();
        if (success) {
            return (true, abi.decode(result, (address)));
        }
    }
}