// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "./Interfaces/ERC165.sol";
import "./Interfaces/IERC1155.sol";
import "./Interfaces/IERC1155MetadataURI.sol";
import "./Interfaces/IPolicyManager.sol";

import "./utils/SafeMath.sol";

import "hardhat/console.sol";

contract Masterfile is ERC165, IERC1155, IERC1155MetadataURI {
    using SafeMath for uint256;
    // using struct incase we need to store more data about the offer later
    struct Offer {
        address buyer;
    }

    struct MST {
        address payable owner;
        string uri_;
        bool forSale;
        uint256 salePrice;
        bytes16 policyId;
        Offer offer;
    }

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(address => uint256) public escrowedEth;
    mapping(uint256 => MST) public tokenData;
    mapping(address => bool) isCurrator;

    uint256 _tokenNonce;
    IPolicyManager _policyManager;
    uint256 fee; // read from policyManager

    event TokenStatusChanged(uint256 tokenId, bool forSale, uint256 salePrice);
    event RequestBuy(uint256 tokenId, address buyer);

    constructor(address[] memory currators, IPolicyManager policyManager_) {
        // register the supported interfaces to conform to ERC1155 via ERC165
        _registerInterface(type(IERC1155).interfaceId);

        // register the supported interfaces to conform to ERC1155MetadataURI via ERC165
        _registerInterface(type(IERC1155MetadataURI).interfaceId);

        for (uint256 i; i < currators.length; i++) {
            isCurrator[currators[i]] = true;
        }

        _policyManager = policyManager_;
        fee = 50000000000;
    }

    // ---------------------- Getters -----------------------------------------

    function uri(uint256 id) external view override returns (string memory) {
        return tokenData[id].uri_;
    }

    function balanceOf(address account, uint256 id)
        public
        view
        override
        returns (uint256)
    {
        require(account != address(0), "MST: Invalid account");

        return _balances[id][account];
    }

    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        public
        view
        override
        returns (uint256[] memory)
    {
        require(
            accounts.length == ids.length,
            "MST: accounts and ids length mismatch"
        );

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    // Can mint and immediately offer for sale
    function MintNFT(
        address payable owner,
        string memory uri_,
        bool forSale,
        uint256 salePrice
    ) public {
        if (owner == address(0)) {
            owner = payable(msg.sender);
        }

        tokenData[_tokenNonce] = MST(
            owner,
            uri_,
            forSale,
            salePrice,
            bytes16(0),
            Offer(address(0))
        );

        emit TransferSingle(msg.sender, address(0), owner, _tokenNonce, 1);

        _balances[_tokenNonce][owner] += 1;

        _tokenNonce += 1;
    }

    // -- Selling --
    function OfferForSale(uint256 tokenId, uint256 value) public {
        MST memory _token = tokenData[tokenId];

        require(msg.sender == _token.owner, "MST: Invalid Owner");
        require(!_token.forSale, "MST: Already for sale");

        tokenData[tokenId].forSale = true;
        tokenData[tokenId].salePrice = value;

        emit TokenStatusChanged(tokenId, true, value);
    }

    // untested
    function RemoveFromSale(uint256 tokenId) public {
        MST memory _token = tokenData[tokenId];

        require(msg.sender == _token.owner, "MST: Invalid Owner");
        require(_token.forSale, "MST: Not for sale");

        tokenData[tokenId].forSale = false;

        emit TokenStatusChanged(tokenId, false, 0);
    }

    // -- Buying --
    function requestBuy(uint256 tokenId) external payable {
        MST memory _token = tokenData[tokenId];

        require(msg.sender != _token.owner, "MST: Already Owned");
        require(_token.forSale, "MST: Not for sale");
        require(_token.offer.buyer == address(0), "MST: Exsisting Offer");
        // TODO: Calculate cost of policy and include in this amount

        // fee for 3 nodes for 1 year

        uint256 policyCost = fee.mul(365).mul(3);

        require(
            msg.value == _token.salePrice.add(policyCost),
            "MST: Insufficient Funds"
        );

        escrowedEth[msg.sender] = msg.value;
        tokenData[tokenId].offer = Offer(msg.sender);

        emit RequestBuy(tokenId, msg.sender);
    }

    function removeBuyRequest(uint256 tokenId) external {
        MST memory _token = tokenData[tokenId];
        require(_token.offer.buyer == msg.sender, "MST: Not Buyer");
        require(
            escrowedEth[msg.sender] >= _token.salePrice,
            "MST: Insufficient Escrow"
        );

        payable(msg.sender).transfer(_token.salePrice);
        escrowedEth[msg.sender] -= _token.salePrice;
        tokenData[tokenId].offer = Offer(address(0));

        emit RequestBuy(tokenId, address(0));
    }

    // -- Executing Sale

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external override onlyCurrator {
        MST memory _token = tokenData[id];

        // Check offer
        require(_token.owner == from, "MST: Invalid Sender");
        require(_token.offer.buyer == to, "MST: Invalid Offer");

        uint256 policyPayment = fee.mul(365).mul(3); // = feeRate * periods * stakers.length && periods = endTimestampPeriod - currentPeriod + 1
        require(
            escrowedEth[to] >= _token.salePrice.add(policyPayment),
            "MST: Insufficient Escrow"
        );

        console.log("Revoking old policy");

        // Revoke old policy

        if (_token.policyId != bytes16(0)) {
            _policyManager.revokePolicy(_token.policyId);
        }

        //-- Create new policy --

        // destruct policy parameters from data
        bytes16 _newPolicyId;
        uint256 _deltaTime;
        address[] memory _nodes = new address[](3); // hard coding 3 nodes for now

        (_newPolicyId, _deltaTime, _nodes) = abi.decode(
            data,
            (bytes16, uint256, address[])
        );

        // 1 years from now
        uint64 _newEndTimestamp = uint64(block.timestamp.add(_deltaTime));

        console.log(_nodes[1]);

        _policyManager.createPolicy{value: policyPayment}(
            _newPolicyId,
            address(this),
            1603605317,
            _nodes
        );

        // Send salePrice to Seller

        _token.owner.transfer(_token.salePrice);

        escrowedEth[to] = _token.salePrice;

        // Transfer NFT

        tokenData[id] = MST(
            payable(to),
            _token.uri_,
            false,
            _token.salePrice,
            _newPolicyId,
            Offer(address(0))
        );

        // Do safer transfer checks...

        emit TransferSingle(msg.sender, from, to, id, 1);

        _balances[id][from] -= 1;
        _balances[id][to] += 1;
    }

    // -- Admin --
    function updatePolicyManager(IPolicyManager policyManager_)
        external
        onlyCurrator
    {
        _policyManager = policyManager_;
    }

    // This is lazy for now. In the future we could allow for operators to offer to buy or sell on behalf of owner
    function isApprovedForAll(address account, address operator)
        external
        view
        override
        returns (bool)
    {
        return isCurrator[operator];
    }

    modifier onlyCurrator() {
        require(isCurrator[msg.sender]);
        _;
    }
}
