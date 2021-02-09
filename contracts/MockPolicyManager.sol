// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// import "./interfaces/IMockPolicyManager.sol";
import "hardhat/console.sol";

contract MockPolicyManager {
    
    struct Range {
        uint128 min;
        uint128 defaultValue;
        uint128 max;
    }

    Range public feeRateRange;

    function createPolicy(
        bytes16 _policyId,
        address _policyOwner,
        uint64 _endTimestamp,
        address[] calldata _nodes
    ) external payable {
        console.log("Policy Created");
    }

    function revokePolicy(bytes16 _policyId)
        external
        returns (uint256 refundValue)
    {
        console.log("Policy Revoked");

        return 0;
    }
}
