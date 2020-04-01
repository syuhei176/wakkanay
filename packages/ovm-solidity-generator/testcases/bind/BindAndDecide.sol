    /**
     * Decides BindAndTestA(BindAndTestA,a).
     */
    function decideBindAndTestA(bytes[] memory _inputs, bytes[] memory _witness) public view returns (bool) {
        types.Property memory inputProperty1 = abi.decode(_inputs[0], (types.Property));
        // And logical connective

        bytes[] memory childInputs0 = new bytes[](1);
        childInputs0[0] = inputProperty1.inputs[0];
        require(
            AtomicPredicate(Foo).decide(childInputs0),
            "Foo must be true"
        );


        bytes[] memory childInputs1 = new bytes[](1);
        childInputs1[0] = inputProperty1.inputs[1];
        require(
            AtomicPredicate(Bar).decide(childInputs1),
            "Bar must be true"
        );

        return true;
    }
