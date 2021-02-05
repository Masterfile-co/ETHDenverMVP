// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

/**
 * @title StakingEscrow
 * @notice Contract holds and locks stakers tokens.
 * Each staker that locks their tokens will receive some compensation
 * @dev |v5.6.1|
 */
interface IStakingEscrow {
    /**
     * @notice Get the value of locked tokens for active stakers in (getCurrentPeriod() + _periods) period
     * as well as stakers and their locked tokens
     * @param _periods Amount of periods for locked tokens calculation
     * @param _startIndex Start index for looking in stakers array
     * @param _maxStakers Max stakers for looking, if set 0 then all will be used
     * @return allLockedTokens Sum of locked tokens for active stakers
     * @return activeStakers Array of stakers and their locked tokens. Stakers addresses stored as uint256
     * @dev Note that activeStakers[0] in an array of uint256, but you want addresses. Careful when used directly!
     */
    function getActiveStakers(
        uint16 _periods,
        uint256 _startIndex,
        uint256 _maxStakers
    )
        external
        view
        returns (uint256 allLockedTokens, uint256[2][] memory activeStakers);
}
