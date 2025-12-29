import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Election contract...");

    const election = await ethers.deployContract("Election");

    await election.waitForDeployment();

    console.log(
        `Election deployed to: ${await election.getAddress()}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
