/* global ethers */
/* eslint prefer-const: "off" */

const { deployer } = require("./libraries/deployer.js");

async function deploy() {
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];

    // deploy Diamond
    const diamond = await deployer("ImpureDiamond", contractOwner.address);
    console.log(`ImpureDiamond deployed:`, diamond.address);
    return diamond;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
    deploy()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

exports.deploy = deploy;
