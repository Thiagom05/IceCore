package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.Gusto;
import com.heladeria.icecore.service.GustoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gustos")
@CrossOrigin("*")
public class GustoController {

    @Autowired
    private GustoService gustoService;

    @GetMapping
    public List<Gusto> getAll() {
        return gustoService.findAll();
    }

    @GetMapping("/activos")
    public List<Gusto> getAllActive() {
        return gustoService.findAllActive();
    }

    @PostMapping
    public Gusto create(@RequestBody Gusto gusto) {
        return gustoService.save(gusto);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Gusto> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(gustoService.toggleActive(id));
    }

    public ResponseEntity<Gusto> toggleStock(@PathVariable Long id) {
        return ResponseEntity.ok(gustoService.toggleStock(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gusto> update(@PathVariable Long id, @RequestBody Gusto gusto) {
        return ResponseEntity.ok(gustoService.update(id, gusto));
    }
}
