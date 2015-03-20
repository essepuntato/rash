package it.unibo.cs.savesd.rash.spar.xtractor.doco;

public class MissmatchingDoCOClassDeclarationException extends Exception {
    
    /**
     * 
     */
    private static final long serialVersionUID = 7922424059495838606L;

    @Override
    public String getMessage() {
        return "The declared DoCO class and Java object mismatched.";
    }

}
