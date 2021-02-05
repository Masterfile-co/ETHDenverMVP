const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");

describe("Masterfile ERC1155", function () {
  let currator, alice, bob, charlie;
  let masterfile;

  beforeEach(async () => {
    let params = await deployProject();
    masterfile = params.masterfile;

    [currator, alice, bob, charlie] = await ethers.getSigners();
  });

  context("With testing Masterfile contract", async () => {
    it("Should mint a new NFT", async () => {
      let _masterfile = await masterfile.connect(alice);

      await _masterfile.MintNFT(
        "0x0000000000000000000000000000000000000000",
        "testuri",
        false,
        0
      );

      let _uri = await _masterfile.uri(0);

      expect(_uri).to.equal("testuri");
    });
  });
});
