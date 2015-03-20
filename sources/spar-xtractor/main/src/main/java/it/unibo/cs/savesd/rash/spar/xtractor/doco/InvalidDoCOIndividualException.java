package it.unibo.cs.savesd.rash.spar.xtractor.doco;


public class InvalidDoCOIndividualException extends Exception {

    public InvalidDoCOIndividualException() {
    }
    
    @Override
    public String getMessage() {
        return "The element provided cannot is an invalid DoCO individual.";
    }
    
    
    
}
