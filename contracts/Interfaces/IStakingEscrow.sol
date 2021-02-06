// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.7.0;

// import "aragon/interfaces/IERC900History.sol";
// import "contracts/Issuer.sol";
// import "contracts/lib/Bits.sol";
// import "contracts/lib/Snapshot.sol";
// import "zeppelin/math/SafeMath.sol";
// import "zeppelin/token/ERC20/SafeERC20.sol";

// /**
// * @notice PolicyManager interface
// */
// interface PolicyManagerInterface {
//     function secondsPerPeriod() external view returns (uint32);
//     function register(address _node, uint16 _period) external;
//     function ping(
//         address _node,
//         uint16 _processedPeriod1,
//         uint16 _processedPeriod2,
//         uint16 _periodToSetDefault
//     ) external;
// }

// /**
// * @notice Adjudicator interface
// */
// interface AdjudicatorInterface {
//     function rewardCoefficient() external view returns (uint32);
// }

// /**
// * @notice WorkLock interface
// */
// interface WorkLockInterface {
//     function token() external view returns (NuCypherToken);
// }

// /**
// * @title StakingEscrowStub
// * @notice Stub is used to deploy main StakingEscrow after all other contract and make some variables immutable
// */
// contract StakingEscrowStub is Upgradeable {
//     using AdditionalMath for uint32;

//     NuCypherToken public immutable token;
//     uint32 public immutable secondsPerPeriod;
//     uint16 public immutable minLockedPeriods;
//     uint256 public immutable minAllowableLockedTokens;
//     uint256 public immutable maxAllowableLockedTokens;

//     /**
//     * @notice Predefines some variables for use when deploying other contracts
//     * @param _token Token contract
//     * @param _minLockedPeriods Min amount of periods during which tokens can be locked
//     * @param _minAllowableLockedTokens Min amount of tokens that can be locked
//     * @param _maxAllowableLockedTokens Max amount of tokens that can be locked
//     */
//     constructor(
//         NuCypherToken _token,
//         uint32 _hoursPerPeriod,
//         uint16 _minLockedPeriods,
//         uint256 _minAllowableLockedTokens,
//         uint256 _maxAllowableLockedTokens
//     ) {
//         require(_token.totalSupply() > 0 &&
//             _hoursPerPeriod != 0 &&
//             _minLockedPeriods > 1 &&
//             _maxAllowableLockedTokens != 0);

//         token = _token;
//         secondsPerPeriod = _hoursPerPeriod.mul32(1 hours);
//         minLockedPeriods = _minLockedPeriods;
//         minAllowableLockedTokens = _minAllowableLockedTokens;
//         maxAllowableLockedTokens = _maxAllowableLockedTokens;
//     }

//     /// @dev the `onlyWhileUpgrading` modifier works through a call to the parent `verifyState`
//     function verifyState(address _testTarget) public override virtual {
//         super.verifyState(_testTarget);

//         // we have to use real values even though this is a stub
//         require(address(delegateGet(_testTarget, this.token.selector)) == address(token));
//         require(uint32(delegateGet(_testTarget, this.secondsPerPeriod.selector)) == secondsPerPeriod);
//         require(uint16(delegateGet(_testTarget, this.minLockedPeriods.selector)) == minLockedPeriods);
//         require(delegateGet(_testTarget, this.minAllowableLockedTokens.selector) == minAllowableLockedTokens);
//         require(delegateGet(_testTarget, this.maxAllowableLockedTokens.selector) == maxAllowableLockedTokens);
//     }
// }

/**
 * @title StakingEscrow
 * @notice Contract holds and locks stakers tokens.
 * Each staker that locks their tokens will receive some compensation
 * @dev |v5.6.1|
 */
interface StakingEscrow {
    event Deposited(address indexed staker, uint256 value, uint16 periods);
    event Locked(
        address indexed staker,
        uint256 value,
        uint16 firstPeriod,
        uint16 periods
    );
    event Divided(
        address indexed staker,
        uint256 oldValue,
        uint16 lastPeriod,
        uint256 newValue,
        uint16 periods
    );
    event Merged(
        address indexed staker,
        uint256 value1,
        uint256 value2,
        uint16 lastPeriod
    );
    event Prolonged(
        address indexed staker,
        uint256 value,
        uint16 lastPeriod,
        uint16 periods
    );
    event Withdrawn(address indexed staker, uint256 value);
    event CommitmentMade(
        address indexed staker,
        uint16 indexed period,
        uint256 value
    );
    event Minted(address indexed staker, uint16 indexed period, uint256 value);
    event Slashed(
        address indexed staker,
        uint256 penalty,
        address indexed investigator,
        uint256 reward
    );
    event ReStakeSet(address indexed staker, bool reStake);
    event WorkerBonded(
        address indexed staker,
        address indexed worker,
        uint16 indexed startPeriod
    );
    event WorkMeasurementSet(address indexed staker, bool measureWork);
    event WindDownSet(address indexed staker, bool windDown);
    event SnapshotSet(address indexed staker, bool snapshotsEnabled);

    struct SubStakeInfo {
        uint16 firstPeriod;
        uint16 lastPeriod;
        uint16 periods;
        uint128 lockedValue;
    }

    struct Downtime {
        uint16 startPeriod;
        uint16 endPeriod;
    }

    struct StakerInfo {
        uint256 value;
        /*
         * Stores periods that are committed but not yet rewarded.
         * In order to optimize storage, only two values are used instead of an array.
         * commitToNextPeriod() method invokes mint() method so there can only be two committed
         * periods that are not yet rewarded: the current and the next periods.
         */
        uint16 currentCommittedPeriod;
        uint16 nextCommittedPeriod;
        uint16 lastCommittedPeriod;
        uint16 stub1; // former slot for lockReStakeUntilPeriod
        uint256 completedWork;
        uint16 workerStartPeriod; // period when worker was bonded
        address worker;
        uint256 flags; // uint256 to acquire whole slot and minimize operations on it
        uint256 reservedSlot1;
        uint256 reservedSlot2;
        uint256 reservedSlot3;
        uint256 reservedSlot4;
        uint256 reservedSlot5;
        Downtime[] pastDowntime;
        SubStakeInfo[] subStakes;
        uint128[] history;
    }

    // // used only for upgrading
    // uint16 internal constant RESERVED_PERIOD = 0;
    // uint16 internal constant MAX_CHECKED_VALUES = 5;
    // // to prevent high gas consumption in loops for slashing
    // uint16 public constant MAX_SUB_STAKES = 30;
    // uint16 internal constant MAX_UINT16 = 65535;

    // // indices for flags
    // uint8 internal constant RE_STAKE_DISABLED_INDEX = 0;
    // uint8 internal constant WIND_DOWN_INDEX = 1;
    // uint8 internal constant MEASURE_WORK_INDEX = 2;
    // uint8 internal constant SNAPSHOTS_DISABLED_INDEX = 3;

    // uint16 public immutable minLockedPeriods;
    // uint16 public immutable minWorkerPeriods;
    // uint256 public immutable minAllowableLockedTokens;
    // uint256 public immutable maxAllowableLockedTokens;

    // PolicyManagerInterface public immutable policyManager;
    // AdjudicatorInterface public immutable adjudicator;
    // WorkLockInterface public immutable workLock;

    // mapping (address => StakerInfo) public stakerInfo;
    // address[] public stakers;
    // mapping (address => address) public stakerFromWorker;

    // mapping (uint16 => uint256) public lockedPerPeriod;
    // uint128[] public balanceHistory;

    // address stub1; // former slot for PolicyManager
    // address stub2; // former slot for Adjudicator
    // address stub3; // former slot for WorkLock

    /**
     * @notice Constructor sets address of token contract and coefficients for minting
     * @param _token Token contract
     * @param _policyManager Policy Manager contract
     * @param _adjudicator Adjudicator contract
     * @param _workLock WorkLock contract. Zero address if there is no WorkLock
     * @param _hoursPerPeriod Size of period in hours
     * @param _issuanceDecayCoefficient (d) Coefficient which modifies the rate at which the maximum issuance decays,
     * only applicable to Phase 2. d = 365 * half-life / LOG2 where default half-life = 2.
     * See Equation 10 in Staking Protocol & Economics paper
     * @param _lockDurationCoefficient1 (k1) Numerator of the coefficient which modifies the extent
     * to which a stake's lock duration affects the subsidy it receives. Affects stakers differently.
     * Applicable to Phase 1 and Phase 2. k1 = k2 * small_stake_multiplier where default small_stake_multiplier = 0.5.
     * See Equation 8 in Staking Protocol & Economics paper.
     * @param _lockDurationCoefficient2 (k2) Denominator of the coefficient which modifies the extent
     * to which a stake's lock duration affects the subsidy it receives. Affects stakers differently.
     * Applicable to Phase 1 and Phase 2. k2 = maximum_rewarded_periods / (1 - small_stake_multiplier)
     * where default maximum_rewarded_periods = 365 and default small_stake_multiplier = 0.5.
     * See Equation 8 in Staking Protocol & Economics paper.
     * @param _maximumRewardedPeriods (kmax) Number of periods beyond which a stake's lock duration
     * no longer increases the subsidy it receives. kmax = reward_saturation * 365 where default reward_saturation = 1.
     * See Equation 8 in Staking Protocol & Economics paper.
     * @param _firstPhaseTotalSupply Total supply for the first phase
     * @param _firstPhaseMaxIssuance (Imax) Maximum number of new tokens minted per period during Phase 1.
     * See Equation 7 in Staking Protocol & Economics paper.
     * @param _minLockedPeriods Min amount of periods during which tokens can be locked
     * @param _minAllowableLockedTokens Min amount of tokens that can be locked
     * @param _maxAllowableLockedTokens Max amount of tokens that can be locked
     * @param _minWorkerPeriods Min amount of periods while a worker can't be changed
     */
    // constructor(
    //     NuCypherToken _token,
    //     PolicyManagerInterface _policyManager,
    //     AdjudicatorInterface _adjudicator,
    //     WorkLockInterface _workLock,
    //     uint32 _hoursPerPeriod,
    //     uint256 _issuanceDecayCoefficient,
    //     uint256 _lockDurationCoefficient1,
    //     uint256 _lockDurationCoefficient2,
    //     uint16 _maximumRewardedPeriods,
    //     uint256 _firstPhaseTotalSupply,
    //     uint256 _firstPhaseMaxIssuance,
    //     uint16 _minLockedPeriods,
    //     uint256 _minAllowableLockedTokens,
    //     uint256 _maxAllowableLockedTokens,
    //     uint16 _minWorkerPeriods
    // )
    //     Issuer(
    //         _token,
    //         _hoursPerPeriod,
    //         _issuanceDecayCoefficient,
    //         _lockDurationCoefficient1,
    //         _lockDurationCoefficient2,
    //         _maximumRewardedPeriods,
    //         _firstPhaseTotalSupply,
    //         _firstPhaseMaxIssuance
    //     )
    // {
    //     // constant `1` in the expression `_minLockedPeriods > 1` uses to simplify the `lock` method
    //     require(_minLockedPeriods > 1 && _maxAllowableLockedTokens != 0);
    //     minLockedPeriods = _minLockedPeriods;
    //     minAllowableLockedTokens = _minAllowableLockedTokens;
    //     maxAllowableLockedTokens = _maxAllowableLockedTokens;
    //     minWorkerPeriods = _minWorkerPeriods;

    //     require(_policyManager.secondsPerPeriod() == _hoursPerPeriod * (1 hours) &&
    //         _adjudicator.rewardCoefficient() != 0 &&
    //         (address(_workLock) == address(0) || _workLock.token() == _token));
    //     policyManager = _policyManager;
    //     adjudicator = _adjudicator;
    //     workLock = _workLock;
    // }

    /**
     * @dev Checks the existence of a staker in the contract
     */
    // modifier onlyStaker()
    // {
    //     StakerInfo storage info = stakerInfo[msg.sender];
    //     require(info.value > 0 || info.nextCommittedPeriod != 0);
    //     _;
    // }

    //------------------------Main getters------------------------
    /**
     * @notice Get all tokens belonging to the staker
     */
    function getAllTokens(address _staker) external view returns (uint256);

    /**
     * @notice Get all flags for the staker
     */
    function getFlags(address _staker)
        external
        view
        returns (
            bool windDown,
            bool reStake,
            bool measureWork,
            bool snapshots
        );

    /**
     * @notice Get the last period of the sub stake
     * @param _staker Staker
     * @param _index Stake index
     */
    function getLastPeriodOfSubStake(address _staker, uint256 _index)
        external
        view
        returns (uint16);

    /**
     * @notice Get the value of locked tokens for a staker in a future period
     * @dev This function is used by PreallocationEscrow so its signature can't be updated.
     * @param _staker Staker
     * @param _periods Amount of periods that will be added to the current period
     */
    function getLockedTokens(address _staker, uint16 _periods)
        external
        view
        returns (uint256 lockedValue);

    /**
     * @notice Get the last committed staker's period
     * @param _staker Staker
     */
    function getLastCommittedPeriod(address _staker)
        external
        view
        returns (uint16);

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

    /**
     * @notice Get worker using staker's address
     */
    function getWorkerFromStaker(address _staker)
        external
        view
        returns (address);

    /**
     * @notice Get work that completed by the staker
     */
    function getCompletedWork(address _staker) external view returns (uint256);

    /**
     * @notice Find index of downtime structure that includes specified period
     * @dev If specified period is outside all downtime periods, the length of the array will be returned
     * @param _staker Staker
     * @param _period Specified period number
     */
    function findIndexOfPastDowntime(address _staker, uint16 _period)
        external
        view
        returns (uint256 index);

    //------------------------Main methods------------------------
    /**
     * @notice Start or stop measuring the work of a staker
     * @param _staker Staker
     * @param _measureWork Value for `measureWork` parameter
     * @return Work that was previously done
     */
    function setWorkMeasurement(address _staker, bool _measureWork)
        external
        returns (uint256);

    /**
     * @notice Bond worker
     * @param _worker Worker address. Must be a real address, not a contract
     */
    function bondWorker(address _worker) external;

    /**
     * @notice Set `reStake` parameter. If true then all staking rewards will be added to locked stake
     * @param _reStake Value for parameter
     */
    function setReStake(bool _reStake) external;

    /**
     * @notice Deposit tokens from WorkLock contract
     * @param _staker Staker address
     * @param _value Amount of tokens to deposit
     * @param _periods Amount of periods during which tokens will be locked
     */
    function depositFromWorkLock(
        address _staker,
        uint256 _value,
        uint16 _periods
    ) external;

    /**
     * @notice Set `windDown` parameter.
     * If true then stake's duration will be decreasing in each period with `commitToNextPeriod()`
     * @param _windDown Value for parameter
     */
    function setWindDown(bool _windDown) external;

    /**
     * @notice Activate/deactivate taking snapshots of balances
     * @param _enableSnapshots True to activate snapshots, False to deactivate
     */
    function setSnapshots(bool _enableSnapshots) external;

    /**
     * @notice Implementation of the receiveApproval(address,uint256,address,bytes) method
     * (see NuCypherToken contract). Deposit all tokens that were approved to transfer
     * @param _from Staker
     * @param _value Amount of tokens to deposit
     * @param _tokenContract Token contract address
     * @notice (param _extraData) Amount of periods during which tokens will be locked
     */
    function receiveApproval(
        address _from,
        uint256 _value,
        address _tokenContract,
        bytes calldata /* _extraData */
    ) external;

    /**
     * @notice Deposit tokens and create new sub-stake. Use this method to become a staker
     * @param _staker Staker
     * @param _value Amount of tokens to deposit
     * @param _periods Amount of periods during which tokens will be locked
     */
    function deposit(
        address _staker,
        uint256 _value,
        uint16 _periods
    ) external;

    /**
     * @notice Deposit tokens and increase lock amount of an existing sub-stake
     * @dev This is preferable way to stake tokens because will be fewer active sub-stakes in the result
     * @param _index Index of the sub stake
     * @param _value Amount of tokens which will be locked
     */
    function depositAndIncrease(uint256 _index, uint256 _value) external;

    /**
     * @notice Lock some tokens as a new sub-stake
     * @param _value Amount of tokens which will be locked
     * @param _periods Amount of periods during which tokens will be locked
     */
    function lockAndCreate(uint256 _value, uint16 _periods) external;

    /**
     * @notice Increase lock amount of an existing sub-stake
     * @param _index Index of the sub-stake
     * @param _value Amount of tokens which will be locked
     */
    function lockAndIncrease(uint256 _index, uint256 _value) external;

    /**
     * @notice Divide sub stake into two parts
     * @param _index Index of the sub stake
     * @param _newValue New sub stake value
     * @param _periods Amount of periods for extending sub stake
     */
    function divideStake(
        uint256 _index,
        uint256 _newValue,
        uint16 _periods
    ) external;

    /**
     * @notice Prolong active sub stake
     * @param _index Index of the sub stake
     * @param _periods Amount of periods for extending sub stake
     */
    function prolongStake(uint256 _index, uint16 _periods) external;

    /**
     * @notice Merge two sub-stakes into one if their last periods are equal
     * @dev It's possible that both sub-stakes will be active after this transaction.
     * But only one of them will be active until next call `commitToNextPeriod` (in the next period)
     * @param _index1 Index of the first sub-stake
     * @param _index2 Index of the second sub-stake
     */
    function mergeStake(uint256 _index1, uint256 _index2) external;

    /**
     * @notice Remove unused sub-stake to decrease gas cost for several methods
     */
    function removeUnusedSubStake(uint16 _index) external;

    /**
     * @notice Withdraw available amount of tokens to staker
     * @param _value Amount of tokens to withdraw
     */
    function withdraw(uint256 _value) external;

    /**
     * @notice Make a commitment to the next period and mint for the previous period
     */
    function commitToNextPeriod() external;

    /**
     * @notice Mint tokens for previous periods if staker locked their tokens and made a commitment
     */
    function mint() external;

    //-------------------------Slashing-------------------------
    /**
     * @notice Slash the staker's stake and reward the investigator
     * @param _staker Staker's address
     * @param _penalty Penalty
     * @param _investigator Investigator
     * @param _reward Reward for the investigator
     */
    function slashStaker(
        address _staker,
        uint256 _penalty,
        address _investigator,
        uint256 _reward
    ) external;

    //-------------Additional getters for stakers info-------------
    /**
     * @notice Return the length of the array of stakers
     */
    function getStakersLength() external view returns (uint256);

    /**
     * @notice Return the length of the array of sub stakes
     */
    function getSubStakesLength(address _staker)
        external
        view
        returns (uint256);

    /**
     * @notice Return the information about sub stake
     */
    function getSubStakeInfo(address _staker, uint256 _index)
        external
        view
        returns (
            // TODO change to structure when ABIEncoderV2 is released (#1501)
            //        public view returns (SubStakeInfo)
            // TODO "virtual" only for tests, probably will be removed after #1512
            uint16 firstPeriod,
            uint16 lastPeriod,
            uint16 periods,
            uint128 lockedValue
        );

    /**
     * @notice Return the length of the array of past downtime
     */
    function getPastDowntimeLength(address _staker)
        external
        view
        returns (uint256);

    /**
     * @notice Return the information about past downtime
     */
    function getPastDowntime(address _staker, uint256 _index)
        external
        view
        returns (
            // TODO change to structure when ABIEncoderV2 is released (#1501)
            //        public view returns (Downtime)
            uint16 startPeriod,
            uint16 endPeriod
        );

    //------------------ ERC900 connectors ----------------------

    function totalStakedForAt(address _owner, uint256 _blockNumber)
        external
        view

        returns (uint256);

    function totalStakedAt(uint256 _blockNumber)
        external
        view

        returns (uint256);

    function supportsHistory() external pure returns (bool);

    //------------------------Upgradeable------------------------

    /// @dev the `onlyWhileUpgrading` modifier works through a call to the parent `verifyState`
    function verifyState(address _testTarget) external;

    /// @dev the `onlyWhileUpgrading` modifier works through a call to the parent `finishUpgrade`
    function finishUpgrade(address _target) external;
}
