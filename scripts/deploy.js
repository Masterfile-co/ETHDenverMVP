const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  const account = await accounts[0].getAddress();

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    // let Mock = await ethers.getContractFactory("MockPolicyManager");
    // let mock = await Mock.deploy();
    // await mock.deployed();

    // console.log(`Policy Manager deployed to ${mock.address}`);

    // let StakingEscrow = await ethers.getContractFactory("MockStakingEscrow");
    // let escrow = await StakingEscrow.deploy();
    // await escrow.deployed();

    // console.log(`Policy Manager deployed to ${escrow.address}`);

    let Masterfile = await ethers.getContractFactory("Masterfile");
    // let masterfile = await Masterfile.deploy(
    //   [account],
    //   mock.address,
    //   escrow.address
    // );

    let masterfile = await Masterfile.deploy(
      [account],
      "0x67E4A942c067Ff25cE7705B69C318cA2Dfa54D64",
    );

    await masterfile.deployed();

    console.log(`Masterfile deployed to ${masterfile.address}`);

    return { masterfile, accounts };
  } else {
    throw Error("No network settings for " + hre.network.name);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployProject = main;
