// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

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
        console.log(_nodes[0]);
    }

    function revokePolicy(bytes16 _policyId)
        external
        override
        returns (uint256 refundValue)
    {
        console.log("Policy Revoked");

        return 0;
    }
}
