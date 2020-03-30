    /**
     * Decides ThereValTestT(ThereValTestT,a).
     */
    function decideThereValTestT(bytes[] memory _inputs, bytes[] memory _witness) public view returns (bool) {
        // check ThereExistsSuchThat

        types.Property memory inputPredicateProperty = abi.decode(_inputs[0], (types.Property));
        bytes[] memory childInputs = new bytes[](inputPredicateProperty.inputs.length + 1);
        for(uint256 i = 0;i < inputPredicateProperty.inputs.length;i++) {
            childInputs[i] = inputPredicateProperty.inputs[i];
        }
        childInputs[inputPredicateProperty.inputs.length] = _inputs[NaN];
        require(
            CompiledPredicate(inputPredicateProperty.predicateAddress).decide(childInputs, utils.subArray(_witness, 1, _witness.length)),
            "InputPredicate must be true"
        );

        return true;
    }
