package it.unibo.cs.savesd.rash.spar.xtractor.doco;

public class NotInstantiableIndividualException extends Exception {
    
    @Override
    public String getMessage() {
        return "The individual cannot be instantiated.";
    }

}
