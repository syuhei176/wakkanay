    /**
     * Decides ThereValTestT(ThereValTestT).
     */
    function decideThereValTestT(bytes[] memory _inputs, bytes[] memory _witness) public view returns (bool) {
        // check ThereExistsSuchThat

        require(
            adjudicationContract.isDecidedById(keccak256(challengeInput)),
            "VariablePredicate must be true"
        );

        return true;
    }
