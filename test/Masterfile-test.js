const { default: BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");

describe("Masterfile ERC1155", function () {
  let currator, alice, bob, charlie;
  let masterfile;
  let abiCoder = ethers.utils.defaultAbiCoder;

  beforeEach(async () => {
    let params = await deployProject();
    masterfile = params.masterfile;

    [currator, alice, bob, charlie] = await ethers.getSigners();
  });

  async function mintNFT(uri, forSale, salePrice) {
    let _masterfile = await masterfile.connect(alice);

    await _masterfile.MintNFT(
      "0x0000000000000000000000000000000000000000",
      uri,
      forSale,
      salePrice
    );
  }

  async function requestBuy(buyer, tokenId, value) {
    let _masterfile = await masterfile.connect(buyer);
    await _masterfile.requestBuy(tokenId, {
      value: value,
    });
  }

  async function executeBuy(tokenId, to, from) {
    let _masterfile = masterfile.connect(currator);

    // faked data
    let data = abiCoder.encode(
      ["bytes32", "uint256[]"],
      [ethers.utils.formatBytes32String(0), [10]]
    );
    await _masterfile.safeTransferFrom(to.address, from.address, 0, 1, data);
  }

  context("With testing Masterfile contract", async () => {
    it("Should mint a new NFT", async () => {
      await mintNFT("testuri", false, 0);

      let _uri = await masterfile.uri(0);

      expect(_uri).to.equal("testuri");

      let balance = await masterfile.balanceOf(alice.address, 0);

      expect(balance.toString()).to.equal("1");

      let _tokenData = await masterfile.tokenData(0);

      expect(_tokenData.owner).to.equal(alice.address);
      expect(_tokenData.forSale).to.equal(false);
      expect(_tokenData.salePrice.toString()).to.equal("0");
    });

    it("Should mint a new NFT and offer for sale", async () => {
      await mintNFT("testuri", true, ethers.utils.parseEther("1"));

      let _tokenData = await masterfile.tokenData(0);
      expect(_tokenData.forSale).to.equal(true);
      expect(_tokenData.salePrice.toString()).to.equal("1000000000000000000");
    });

    it("should let bob offer to buy NFT", async () => {
      await mintNFT("testuri", true, ethers.utils.parseEther("1"));

      let initBal = await bob.getBalance();

      let fee = new BigNumber("50000000000").times(3).times(36500);
      let cost = ethers.utils.parseEther("1");

      await requestBuy(bob, 0, fee.plus(cost.toString()).toString());

      let finalBal = await bob.getBalance();

      // includes gas
      expect(initBal.sub(finalBal)).to.equal("1006059200000000000");

      let escrow = await masterfile.escrowedEth(bob.address);
      expect(escrow.toString()).to.equal("1005475000000000000");

      let offer = await masterfile.tokenData(0);
      offer = offer.offer;
      expect(offer.buyer).to.equal(bob.address);
    });

    it("should let currator execute sale", async () => {
      await mintNFT("testuri", true, ethers.utils.parseEther("1"));

      let fee = new BigNumber("50000000000").times(3).times(36500);
      let cost = ethers.utils.parseEther("1");

      await requestBuy(bob, 0, fee.plus(cost.toString()).toString());

      let initBal = await alice.getBalance();

      await executeBuy(0, alice, bob);

      let finalBal = await alice.getBalance();

      expect(finalBal.sub(initBal)).to.equal("1000000000000000000");

      let _token = await masterfile.tokenData(0);

      expect(_token.owner).to.equal(bob.address);

      let bal = await masterfile.balanceOf(bob.address, 0);

      expect(bal.toString()).to.equal("1");

      bal = await masterfile.balanceOf(alice.address, 0);

      expect(bal.toString()).to.equal("0");
    });

    it("should let sale to third pary", async () => {
      await mintNFT("testuri", true, ethers.utils.parseEther("1"));

      let fee = new BigNumber("50000000000").times(3).times(36500);
      let cost = ethers.utils.parseEther("1");

      await requestBuy(bob, 0, fee.plus(cost.toString()).toString());

      await executeBuy(0, alice, bob);

      // offer for sale

      let _masterfile = await masterfile.connect(bob);

      await _masterfile.OfferForSale(0, ethers.utils.parseEther("2"));

      cost = ethers.utils.parseEther("2");

      await requestBuy(charlie, 0, fee.plus(cost.toString()).toString());

      let token = await masterfile.tokenData(0);

      expect(token.forSale).to.equal(true);
      expect(token.salePrice).to.equal(ethers.utils.parseEther("2"));

      expect(token.offer.buyer).to.equal(charlie.address);

      let initBal = await bob.getBalance();

      await executeBuy(0, bob, charlie);

      let finalBal = await bob.getBalance();

      expect(finalBal.sub(initBal).toString()).to.equal("2000000000000000000");

      let bal = await masterfile.balanceOf(charlie.address, 0);

      expect(bal.toString()).to.equal("1");

      bal = await masterfile.balanceOf(bob.address, 0);

      expect(bal.toString()).to.equal("0");
    });
  });
});
