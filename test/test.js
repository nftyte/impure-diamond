/* global describe it before ethers */

const {
    getSelectors,
    FacetCutAction,
} = require("../scripts/libraries/diamond.js");

const { deploy } = require("../scripts/deploy.js");

const { assert } = require("chai");

let diamond,
    diamondCut,
    diamondLoupe,
    ownership,
    addresses;

describe.only("Impure Diamond Test", async function () {
    before(async function () {
        diamond = await deploy();
        diamondCut = await ethers.getContractAt("DiamondCut", diamond.address);
        diamondLoupe = await ethers.getContractAt(
            "DiamondLoupe",
            diamond.address
        );
        ownership = await ethers.getContractAt("Ownership", diamond.address);
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
});
