    /**
     * Decides EvalTestA(EvalTestA,a,b).
     */
    function decideEvalTestA(bytes[] memory _inputs, bytes[] memory _witness) public view returns (bool) {
        // And logical connective

        bytes[] memory childInputs0 = new bytes[](1);
        childInputs0[0] = _inputs[0];
        require(
            AtomicPredicate(Foo).decide(childInputs0),
            "Foo must be true"
        );


        require(adjudicationContract.isDecidedById(keccak256(_inputs[1])));

        return true;
    }
