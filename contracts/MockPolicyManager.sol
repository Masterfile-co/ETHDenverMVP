// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IPolicyManager.sol";
import "hardhat/console.sol";

contract MockPolicyManager is IPolicyManager {
    function createPolicy(
        bytes16 _policyId,
        address _policyOwner,
        uint64 _endTimestamp,
        address[] calldata _nodes
    ) external payable override {
        console.log("Policy Created");
    }

    function revokePolicy(bytes16 _policyId)
        external
        override
        returns (uint256 refundValue)
    {
        console.log("Policy Created");
        return 0;
    }
}
