/* global ethers */

async function deployer(contract, ...args) {
    const Deployable = await ethers.getContractFactory(contract);
    const deployed = await Deployable.deploy(...args);
    await deployed.deployed();
    console.log(`${contract} deployed:`, deployed.address);
    return deployed;
}

exports.deployer = deployer;
