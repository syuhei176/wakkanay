pragma solidity ^0.5.3;
pragma experimental ABIEncoderV2;
import {DataTypes as types} from './DataTypes.sol';


interface UniversalAdjudicationContract {
    function setPredicateDecision(bytes32 _gameId, bool _decision) external;

    function isDecided(types.Property calldata _property)
        external
        view
        returns (bool);

    function isDecidedById(bytes32 _propertyId) external view returns (bool);
}
