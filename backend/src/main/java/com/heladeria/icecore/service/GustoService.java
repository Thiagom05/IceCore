package com.heladeria.icecore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.heladeria.icecore.entity.Gusto;
import com.heladeria.icecore.repository.GustoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class GustoService {

    @Autowired
    private GustoRepository gustoRepository;

    // Devuelve todos los gustos, activos o no
    public List<Gusto> findAll() {
        return gustoRepository.findAll();
    }

    // Devuelve todos los gustos activos
    public List<Gusto> findAllActive() {
        return gustoRepository.findByActivoTrue();
    }

    public Optional<Gusto> findById(Long id) {
        return gustoRepository.findById(id);
    }

    public Gusto save(Gusto gusto) {
        return gustoRepository.save(gusto);
    }

    public void deleteById(Long id) {
        gustoRepository.deleteById(id);
    }

    public Gusto toggleStock(Long id) {
        Gusto gusto = gustoRepository.findById(id).orElseThrow(() -> new RuntimeException("Gusto no encontrado"));
        gusto.setHayStock(!gusto.isHayStock());
        return gustoRepository.save(gusto);
    }

    public Gusto toggleActive(Long id) {
        Gusto gusto = gustoRepository.findById(id).orElseThrow(() -> new RuntimeException("Gusto no encontrado"));
        gusto.setActivo(!gusto.isActivo());
        return gustoRepository.save(gusto);
    }

    public Gusto update(Long id, Gusto gustoDetails) {
        Gusto gusto = gustoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gusto no encontrado con id: " + id));

        // Verifica que el nuevo nombre no esté en uso por OTRO gusto
        gustoRepository.findByNombreIgnoreCaseAndIdNot(gustoDetails.getNombre(), id)
                .ifPresent(duplicate -> {
                    throw new RuntimeException("Ya existe un sabor con el nombre \"" + gustoDetails.getNombre() + "\"");
                });

        gusto.setNombre(gustoDetails.getNombre());
        gusto.setDescripcion(gustoDetails.getDescripcion());
        gusto.setCategoria(gustoDetails.getCategoria());

        return gustoRepository.save(gusto);
    }
}
