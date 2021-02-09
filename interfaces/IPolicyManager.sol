// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.7.0;

/**
 * @title PolicyManager
 * @notice Contract holds policy data and locks accrued policy fees
 * @dev |v6.1.3|
 */
interface IPolicyManager {
    event PolicyCreated(
        bytes16 indexed policyId,
        address indexed sponsor,
        address indexed owner,
        uint256 feeRate,
        uint64 startTimestamp,
        uint64 endTimestamp,
        uint256 numberOfNodes
    );
    event ArrangementRevoked(
        bytes16 indexed policyId,
        address indexed sender,
        address indexed node,
        uint256 value
    );
    event RefundForArrangement(
        bytes16 indexed policyId,
        address indexed sender,
        address indexed node,
        uint256 value
    );
    event PolicyRevoked(
        bytes16 indexed policyId,
        address indexed sender,
        uint256 value
    );
    event RefundForPolicy(
        bytes16 indexed policyId,
        address indexed sender,
        uint256 value
    );
    event MinFeeRateSet(address indexed node, uint256 value);
    // TODO #1501
    // Range range
    event FeeRateRangeSet(
        address indexed sender,
        uint256 min,
        uint256 defaultValue,
        uint256 max
    );
    event Withdrawn(
        address indexed node,
        address indexed recipient,
        uint256 value
    );

    struct ArrangementInfo {
        address node;
        uint256 indexOfDowntimePeriods;
        uint16 lastRefundedPeriod;
    }

    struct Policy {
        bool disabled;
        address payable sponsor;
        address owner;
        uint128 feeRate;
        uint64 startTimestamp;
        uint64 endTimestamp;
        uint256 reservedSlot1;
        uint256 reservedSlot2;
        uint256 reservedSlot3;
        uint256 reservedSlot4;
        uint256 reservedSlot5;
        ArrangementInfo[] arrangements;
    }

    struct NodeInfo {
        uint128 fee;
        uint16 previousFeePeriod;
        uint256 feeRate;
        uint256 minFeeRate;
        mapping(uint16 => int256) feeDelta;
    }

    // TODO used only for `delegateGetNodeInfo`, probably will be removed after #1512
    struct MemoryNodeInfo {
        uint128 fee;
        uint16 previousFeePeriod;
        uint256 feeRate;
        uint256 minFeeRate;
    }

    struct Range {
        uint128 min;
        uint128 defaultValue;
        uint128 max;
    }

    // StakingEscrow public immutable escrow;
    // uint32 public immutable secondsPerPeriod;

    // mapping (bytes16 => Policy) public policies;
    // mapping (address => NodeInfo) public nodes;
    // Range public feeRateRange;

    /**
     * @notice Constructor sets address of the escrow contract
     * @param _escrow Escrow contract
     */
    // constructor(StakingEscrow _escrow) {
    //     // if the input address is not the StakingEscrow then calling `secondsPerPeriod` will throw error
    //     uint32 localSecondsPerPeriod = _escrow.secondsPerPeriod();
    //     require(localSecondsPerPeriod > 0);
    //     secondsPerPeriod = localSecondsPerPeriod;
    //     escrow = _escrow;
    // }

    /**
     * @dev Checks that sender is the StakingEscrow contract
     */
    // modifier onlyEscrowContract()
    // {
    //     require(msg.sender == address(escrow));
    //     _;
    // }

    /**
     * @return Number of current period
     */
    function getCurrentPeriod() external view returns (uint16);

    /**
     * @notice Register a node
     * @param _node Node address
     * @param _period Initial period
     */
    function register(address _node, uint16 _period) external;

    /**
     * @notice Set minimum, default & maximum fee rate for all stakers and all policies ('global fee range')
     */
    // TODO # 1501
    // function setFeeRateRange(Range calldata _range) external onlyOwner {
    function setFeeRateRange(
        uint128 _min,
        uint128 _default,
        uint128 _max
    ) external;

    /**
     * @notice Set the minimum acceptable fee rate (set by staker for their associated worker)
     * @dev Input value must fall within `feeRateRange` (global fee range)
     */
    function setMinFeeRate(uint256 _minFeeRate) external;

    /**
     * @notice Get the minimum acceptable fee rate (set by staker for their associated worker)
     */
    function getMinFeeRate(address _node) external view returns (uint256);

    /**
     * @notice Create policy
     * @dev Generate policy id before creation
     * @param _policyId Policy id
     * @param _policyOwner Policy owner. Zero address means sender is owner
     * @param _endTimestamp End timestamp of the policy in seconds
     * @param _nodes Nodes that will handle policy
     */
    function createPolicy(
        bytes16 _policyId,
        address _policyOwner,
        uint64 _endTimestamp,
        address[] calldata _nodes
    ) external payable;

    /**
     * @notice Get policy owner
     */
    function getPolicyOwner(bytes16 _policyId) external view returns (address) ;

    /**
     * @notice Call from StakingEscrow to update node info once per period.
     * Set default `feeDelta` value for specified period and update node fee
     * @param _node Node address
     * @param _processedPeriod1 Processed period
     * @param _processedPeriod2 Processed period
     * @param _periodToSetDefault Period to set
     */
    function ping(
        address _node,
        uint16 _processedPeriod1,
        uint16 _processedPeriod2,
        uint16 _periodToSetDefault
    ) external ;


    /**
     * @notice Withdraw fee by node
     */
    function withdraw() external returns (uint256);

    /**
     * @notice Withdraw fee by node
     * @param _recipient Recipient of the fee
     */
    function withdraw(address payable _recipient) external returns (uint256) ;


    /**
     * @notice Revoke policy by the sponsor
     * @param _policyId Policy id
     */
    function revokePolicy(bytes16 _policyId)
        external
        returns (uint256 refundValue)
    ;

    /**
     * @notice Revoke arrangement by the sponsor
     * @param _policyId Policy id
     * @param _node Node that will be excluded
     */
    function revokeArrangement(bytes16 _policyId, address _node)
        external
        returns (uint256 refundValue)
    ;

    /**
     * @notice Get unsigned hash for revocation
     * @param _policyId Policy id
     * @param _node Node that will be excluded
     * @return Revocation hash, EIP191 version 0x45 ('E')
     */
    function getRevocationHash(bytes16 _policyId, address _node)
        external
        view
        returns (bytes32)
    ;


    /**
     * @notice Revoke policy or arrangement using owner's signature
     * @param _policyId Policy id
     * @param _node Node that will be excluded, zero address if whole policy will be revoked
     * @param _signature Signature of owner, EIP191 version 0x45 ('E')
     */
    function revoke(
        bytes16 _policyId,
        address _node,
        bytes calldata _signature
    ) external returns (uint256 refundValue) ;

    /**
     * @notice Refund part of fee by the sponsor
     * @param _policyId Policy id
     */
    function refund(bytes16 _policyId) external ;

    /**
     * @notice Refund part of one node's fee by the sponsor
     * @param _policyId Policy id
     * @param _node Node address
     */
    function refund(bytes16 _policyId, address _node)
        external
        returns (uint256 refundValue)
    ;

    /**
     * @notice Calculate amount of refund
     * @param _policyId Policy id
     */
    function calculateRefundValue(bytes16 _policyId)
        external
        view
        returns (uint256 refundValue)
    ;

    /**
     * @notice Calculate amount of refund
     * @param _policyId Policy id
     * @param _node Node
     */
    function calculateRefundValue(bytes16 _policyId, address _node)
        external
        view
        returns (uint256 refundValue)
    ;

    /**
     * @notice Get number of arrangements in the policy
     * @param _policyId Policy id
     */
    function getArrangementsLength(bytes16 _policyId)
        external
        view
        returns (uint256)
    ;

    /**
     * @notice Get information about staker's fee rate
     * @param _node Address of staker
     * @param _period Period to get fee delta
     */
    function getNodeFeeDelta(address _node, uint16 _period)
        external
        view
        returns (
            // TODO "virtual" only for tests, probably will be removed after #1512
            int256
        )
    ;

    /**
     * @notice Return the information about arrangement
     */
    function getArrangementInfo(bytes16 _policyId, uint256 _index)
        external
        view
        returns (
            // TODO change to structure when ABIEncoderV2 is released (#1501)
            //        public view returns (ArrangementInfo)
            address node,
            uint256 indexOfDowntimePeriods,
            uint16 lastRefundedPeriod
        )
    ;



    /// @dev the `onlyWhileUpgrading` modifier works through a call to the parent `verifyState`
    function verifyState(address _testTarget) external  ;

    /// @dev the `onlyWhileUpgrading` modifier works through a call to the parent `finishUpgrade`
    function finishUpgrade(address _target) external  ;
}
