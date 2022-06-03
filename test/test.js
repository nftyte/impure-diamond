/* global describe it before ethers */

const {
    getSelectors,
    FacetCutAction,
} = require("../scripts/libraries/diamond.js");

const { deployer } = require("../scripts/libraries/deployer.js");

const { deploy } = require("../scripts/deploy.js");

const { assert } = require("chai");
const { ethers } = require("hardhat");

let diamond,
    diamondCut,
    diamondCutFacet,
    diamondLoupe,
    diamondLoupeFacet,
    ownership,
    diamondInit,
    addresses,
    result,
    tx,
    receipt;

describe.only("Impure Diamond Test", async function () {
    before(async function () {
        diamond = await deploy();
        diamondCut = await ethers.getContractAt("DiamondCut", diamond.address);
        diamondCutFacet = await deployer("DiamondCutFacet");
        diamondLoupe = await ethers.getContractAt(
            "DiamondLoupe",
            diamond.address
        );
        diamondLoupeFacet = await deployer("DiamondLoupeFacet");
        ownership = await ethers.getContractAt("Ownership", diamond.address);
        diamondInit = await deployer("DiamondInit");
        addresses = [];
    });

    it("should have one facet -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupe.facetAddresses()) {
            addresses.push(address);
        }
        assert.equal(addresses.length, 1);
    });

    it("facets should have the right function selectors -- call to facetFunctionSelectors function", async () => {
        const selectors = await diamondLoupe.facetFunctionSelectors(
            diamond.address
        );
        assert.sameMembers(selectors, getSelectors(diamond));
    });

    it("should replace supportsInterface function", async () => {
        const selectors = getSelectors(diamondLoupeFacet).get([
            "supportsInterface(bytes4)",
        ]);
        await replaceSelectors(diamondLoupeFacet.address, selectors);
        result = await diamondLoupe.facetFunctionSelectors(
            diamondLoupeFacet.address
        );
        assert.sameMembers(result, selectors);
    });

    it("should replace supportsInterface function back", async () => {
        const selectors = getSelectors(diamondLoupeFacet).get([
            "supportsInterface(bytes4)",
        ]);
        await replaceSelectors(diamond.address, selectors);
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(result, getSelectors(diamond));
    });

    it("should remove some diamondLoupe functions", async () => {
        const functionsToRemove = ["facets()", "facetAddress(bytes4)"];
        const selectors = getSelectors(diamondLoupe).get(functionsToRemove);
        await removeSelectors(ethers.constants.AddressZero, selectors);
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(
            result,
            getSelectors(diamond).remove(functionsToRemove)
        );
    });

    it("should add facets() back", async () => {
        const selectors = getSelectors(diamondLoupe).get(["facets()"]);
        await addSelectors(diamond.address, selectors);
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(result, getSelectors(diamond).remove(["facetAddress(bytes4)"]));
    });

    it("shouldn't be able to replace immutable functions", async () => {
        const selectors = getSelectors(diamondLoupe).get(["facets()"]);
        try {
            await replaceSelectors(diamondLoupeFacet.address, selectors);
        } catch (e) {
            assert.isAbove(e.message.indexOf("immutable"), -1);
        }
    });

    it("should make facets() mutable and add facetAddress(bytes4)", async () => {
        const selectors = getSelectors(diamondLoupe);
        await facetCut(
            diamond.address,
            selectors.get(["facetAddress(bytes4)"]),
            FacetCutAction.Add,
            diamondInit.address,
            diamondInit.interface.encodeFunctionData("init", [selectors])
        );
    });
});

async function addSelectors(facetAddress, functionSelectors) {
    return await facetCut(facetAddress, functionSelectors, FacetCutAction.Add);
}

async function replaceSelectors(facetAddress, functionSelectors) {
    return await facetCut(
        facetAddress,
        functionSelectors,
        FacetCutAction.Replace
    );
}

async function removeSelectors(facetAddress, functionSelectors) {
    return await facetCut(
        facetAddress,
        functionSelectors,
        FacetCutAction.Remove
    );
}

async function facetCut(
    facetAddress,
    functionSelectors,
    action,
    init = ethers.constants.AddressZero,
    calldata = "0x"
) {
    tx = await diamondCut.diamondCut(
        [
            {
                facetAddress,
                action,
                functionSelectors,
            },
        ],
        init,
        calldata,
        { gasLimit: 800000 }
    );
    receipt = await tx.wait();
    if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    return tx;
}
