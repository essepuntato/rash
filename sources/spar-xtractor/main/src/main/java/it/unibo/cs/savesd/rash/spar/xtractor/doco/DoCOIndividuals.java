package it.unibo.cs.savesd.rash.spar.xtractor.doco;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

public class DoCOIndividuals<T extends DoCOIndividual> implements Iterable<T>{

    protected List<T> individuals;
    
    public DoCOIndividuals() {
        this.individuals = new ArrayList<T>();
    }
    
    public DoCOIndividuals(List<T> individuals) {
        this.individuals = individuals;
    }
    
    @Override
    public Iterator<T> iterator() {
        return individuals.iterator();
    }
    
    public boolean add(T individual){
        return individuals.add(individual);
    }
    
    public void add(int index, T individual){
        individuals.add(index, individual);
    }
    
    public boolean addAll(DoCOIndividuals<T> individuals){
        return this.individuals.addAll(individuals.individuals);
    }
    
    public T remove(int index){
        return individuals.remove(index);
    }
    
    public boolean remove(T individual){
        return individuals.remove(individual);
    }
    
    public boolean removeAll(Collection<T> individuals){
        return individuals.removeAll(individuals);
    }
    
    
}
