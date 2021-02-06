// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// import "./interfaces/IStakingEscrow.sol";
import "hardhat/console.sol";

// is IStakingEscrow
contract StakingEscrow {
    function getActiveStakers(
        uint16 _periods,
        uint256 _startIndex,
        uint256 _maxStakers
    )
        external
        view
        returns (
            // override
            uint256 allLockedTokens,
            uint256[2][] memory activeStakers
        )
    {
        activeStakers = new uint256[2][](_maxStakers);
        for (uint256 i; i < _maxStakers; i++) {
            address staker = address(i + 1);
            activeStakers[i][0] = uint256(staker);
            activeStakers[i][1] = (i + 1) * 1000;
        }
    }
}
