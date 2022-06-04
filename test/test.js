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
    ierc165,
    diamondInit,
    addresses,
    result,
    tx,
    receipt;

describe("Impure Diamond Test", async function () {
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
        ierc165 = await ethers.getContractAt("IERC165", diamond.address);
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

    it("should upgrade supportsInterface function", async () => {
        const selectors = getSelectors(diamondLoupeFacet).get([
            "supportsInterface(bytes4)",
        ]);
        await replaceSelectors(diamondLoupeFacet.address, selectors);
        result = await diamondLoupe.facetFunctionSelectors(
            diamondLoupeFacet.address
        );
        assert.sameMembers(result, selectors);
    });

    it("should test call to supportsInterface function", async () => {
        tx = await ierc165.supportsInterface("0x01ffc9a7");
        receipt = await tx.wait();
    });

    it("should downgrade supportsInterface function", async () => {
        const selectors = getSelectors(diamondLoupeFacet).get([
            "supportsInterface(bytes4)",
        ]);
        await replaceSelectors(diamond.address, selectors);
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(result, getSelectors(diamond));
    });

    it("should test call to supportsInterface function", async () => {
        let gasUsed = receipt.gasUsed;
        tx = await ierc165.supportsInterface("0x01ffc9a7");
        receipt = await tx.wait();
        assert.isTrue(receipt.gasUsed.lt(gasUsed));
        // console.log(receipt.gasUsed, gasUsed);
    });

    it("remove facets and facetAddress functions", async () => {
        const functionsToRemove = ["facets()", "facetAddress(bytes4)"];
        const selectors = getSelectors(diamondLoupe).get(functionsToRemove);
        await removeSelectors(ethers.constants.AddressZero, selectors);
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(
            result,
            getSelectors(diamond).remove(functionsToRemove)
        );
    });

    it("shouldn't be able to call removed functions -- attempt call to facets function", async () => {
        try {
            await diamondLoupe.facets();
        } catch (e) {
            assert.isAbove(e.message.indexOf("exist"), -1);
        }
    });

    it("should add facets and facetAddress functions", async () => {
        const selectors = getSelectors(diamondLoupe);
        const facetSelectors = selectors.get(["facetAddress(bytes4)"]);
        const diamondSelectors = selectors.get(["facets()"]);

        await addSelectors(diamond.address, diamondSelectors);
        await addSelectors(diamondLoupeFacet.address, facetSelectors);
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(
            result,
            getSelectors(diamond).remove(["facetAddress(bytes4)"])
        );
        result = await diamondLoupe.facetFunctionSelectors(
            diamondLoupeFacet.address
        );
        assert.sameMembers(result, facetSelectors);
    });

    it("test diamondLoupeFacet function call -- call to facetAddress function", async () => {
        const selectors = getSelectors(diamondLoupe).get([
            "facetAddress(bytes4)",
        ]);
        result = await diamondLoupe.facetAddress(selectors[0]);
        assert.equal(diamondLoupeFacet.address, result);
    });

    it("prevent replacing immutable functions -- attempt replace facets function", async () => {
        const selectors = getSelectors(diamondLoupe).get(["facets()"]);
        try {
            await replaceSelectors(diamondLoupeFacet.address, selectors);
        } catch (e) {
            assert.isAbove(e.message.indexOf("immutable"), -1);
        }
    });

    it("prevent removing immutable functions -- attempt remove facets function", async () => {
        const selectors = getSelectors(diamondLoupe).get(["facets()"]);
        try {
            await removeSelectors(ethers.constants.AddressZero, selectors);
        } catch (e) {
            assert.isAbove(e.message.indexOf("immutable"), -1);
        }
    });

    it("should make facetAddress function immutable", async () => {
        const selectors = getSelectors(diamond);
        await replaceSelectors(
            diamond.address,
            selectors.get(["facetAddress(bytes4)"])
        );
        result = await diamondLoupe.facetFunctionSelectors(diamond.address);
        assert.sameMembers(result, selectors);
    });
});

async function addSelectors(facetAddress, functionSelectors) {
    return await facetCut([
        {
            facetAddress,
            functionSelectors,
            action: FacetCutAction.Add,
        },
    ]);
}

async function replaceSelectors(facetAddress, functionSelectors) {
    return await facetCut([
        {
            facetAddress,
            functionSelectors,
            action: FacetCutAction.Replace,
        },
    ]);
}

async function removeSelectors(facetAddress, functionSelectors) {
    return await facetCut([
        {
            facetAddress,
            functionSelectors,
            action: FacetCutAction.Remove,
        },
    ]);
}

async function facetCut(
    facetCuts,
    init = ethers.constants.AddressZero,
    calldata = "0x"
) {
    tx = await diamondCut.diamondCut(facetCuts, init, calldata, {
        gasLimit: 800000,
    });
    receipt = await tx.wait();
    if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    return tx;
}
