export default `pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import {DataTypes as types} from "ovm-contracts/DataTypes.sol";

interface AtomicPredicate {
    function decideTrue(bytes[] calldata _inputs) external;
    function decide(bytes[] calldata _inputs) external view returns (bool);
}`
