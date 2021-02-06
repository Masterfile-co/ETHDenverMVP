const { default: BigNumber } = require("bignumber.js");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployProject } = require("../scripts/deploy.js");
const {
  result: policyManagerAbi,
} = require("../scripts/abis/PolicyManagers.json");
const {
  result: stakingEscrowAbi,
} = require("../scripts/abis/StakingEscrow.json");

describe("Masterfile ERC1155", function () {
  let currator, alice, bob, charlie;
  let masterfile;
  let policyManager;
  let stakingEscrow;
  let abiCoder = ethers.utils.defaultAbiCoder;

  beforeEach(async () => {
    let params = await deployProject();
    masterfile = params.masterfile;

    [currator, alice, bob, charlie] = await ethers.getSigners();

    policyManager = new ethers.Contract(
      "0x67E4A942c067Ff25cE7705B69C318cA2Dfa54D64",
      policyManagerAbi,
      currator
    );

    stakingEscrow = new ethers.Contract(
      "0xbbD3C0C794F40c4f993B03F65343aCC6fcfCb2e2",
      stakingEscrowAbi,
      currator
    );
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
    let data = await getNodes();

    await _masterfile.safeTransferFrom(to.address, from.address, 0, 1, data);
  }

  async function getNodes() {
    let activeNodes = await stakingEscrow.getActiveStakers(100, 0, 10);

    let nodes = [];

    for (var i = 0; i < 3; i++) {
      nodes[i] = activeNodes.activeStakers[i][0].toHexString();
    }

    // [policyId<bytes16>, deltaTime<uint256>, nodes<address[]>]
    let data = abiCoder.encode(
      ["bytes16", "uint256", "address[]"],
      ["0x4c769263d567ac1f4266cdbb659aff1c", 31536000, nodes]
    );

    return data;
  }

  context("With testing Masterfile contract", async () => {
    xit("Should mint a new NFT", async () => {
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

    xit("Should mint a new NFT and offer for sale", async () => {
      await mintNFT("testuri", true, ethers.utils.parseEther("1"));

      let _tokenData = await masterfile.tokenData(0);
      expect(_tokenData.forSale).to.equal(true);
      expect(_tokenData.salePrice.toString()).to.equal("1000000000000000000");
    });

    xit("should let bob offer to buy NFT", async () => {
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

    xit("should let currator execute sale", async () => {
      await mintNFT("testuri", true, ethers.utils.parseEther("1"));

      let fee = new BigNumber("50000000000").times(3).times(365);
      let cost = ethers.utils.parseEther("1");

      await requestBuy(bob, 0, fee.plus(cost.toString()).toString());

      let initBal = await alice.getBalance();

      await executeBuy(0, alice, bob);

      // let policyOwner = await policyManager.getPolicyOwner("0x4c769263d567ac1f4266cdbb659aff1c")

      // console.log(policyOwner);

      // let finalBal = await alice.getBalance();

      // expect(finalBal.sub(initBal)).to.equal("1000000000000000000");

      // let _token = await masterfile.tokenData(0);

      // expect(_token.owner).to.equal(bob.address);

      // let bal = await masterfile.balanceOf(bob.address, 0);

      // expect(bal.toString()).to.equal("1");

      // bal = await masterfile.balanceOf(alice.address, 0);

      // expect(bal.toString()).to.equal("0");
    });

    xit("should let sale to third pary", async () => {
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

  context("With testing mainnet fork", async () => {
    xit("should read current fees", async () => {
      let fees = await policyManager.feeRateRange();

      let activeNodes = await stakingEscrow.getActiveStakers(100, 0, 10);

      let nodes = [];

      for (var i = 0; i < 3; i++) {
        nodes[i] = activeNodes.activeStakers[i][0].toHexString();
      }

      // [policyId<bytes16>, deltaTime<uint256>, nodes<address[]>]
      let data = abiCoder.encode(
        ["bytes16", "uint256", "address[]"],
        ["0x4c769263d567ac1f4266cdbb659aff1c", 31536000, nodes]
      );
    });

    it("should call policy manger to create policy", async () => {
      // let activeNodes = await stakingEscrow.getActiveStakers(100, 0, 10);

      // let nodes = [];

      // for (var i = 0; i < 3; i++) {
      //   nodes[i] = activeNodes.activeStakers[i][0].toHexString();
      // }

      // // [policyId<bytes16>, deltaTime<uint256>, nodes<address[]>]
      // let data = abiCoder.encode(
      //   ["bytes16", "uint256", "address[]"],
      //   ["0x4c769263d567ac1f4266cdbb659aff1c", 31536000, nodes]
      // );

      // let policyOwner = await policyManager.getPolicyOwner(
      //   "0x8d266cc466d904f2fca336c02616492d"
      // );

      // console.log(policyOwner);

      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0xf8C2f3cEe3cFBDCbb18DE3a41A8F6E369382f2Ac"],
      });

      // testing singer
      let _bob = await ethers.provider.getSigner(
        "0xf8C2f3cEe3cFBDCbb18DE3a41A8F6E369382f2Ac"
      );

      const tx = alice.sendTransaction({
        to: "0xf8C2f3cEe3cFBDCbb18DE3a41A8F6E369382f2Ac",
        value: ethers.utils.parseEther("1.0"),
      });

      policyManager = policyManager.connect(_bob);

      // await policyManager.revokePolicy("0x8d266cc466d904f2fca336c02616492d");

      // nodes = [
      //   "0xC23F4F463c779Dd27c08939dC495b8b35C952c89",
      //   "0xEbaeCD22304445A471630600708A197A311daB7F",
      //   "0x5cF1703A1c99A4b42Eb056535840e93118177232",
      // ];

      await policyManager.createPolicy(
        "0x4c769263d567ac1f4266cdbb659aff1b",
        "0xf8C2f3cEe3cFBDCbb18DE3a41A8F6E369382f2Ac",
        1603604547,
        ["0xc23f4f463c779dd27c08939dc495b8b35c952c89"],
        { value: ethers.utils.parseEther("0.0000001") }
      );
    });
  });
});
