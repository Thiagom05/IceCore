package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.Gusto;
import com.heladeria.icecore.service.GustoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @RestController: Indica que esta clase responderá a peticiones HTTP (GET, POST, etc.)
// y que la respuesta será JSON (no una vista HTML clásica).
@RestController
// @RequestMapping: Define la URL base. Todo lo de aquí será "/api/gustos"
@RequestMapping("/api/gustos")
// @CrossOrigin: Permite que el Frontend (que correrá en otro puerto) pueda
// llamarnos.
@CrossOrigin("*")
public class GustoController {

    @Autowired
    private GustoService gustoService;

    // GET /api/gustos -> Devuelve todos los gustos
    @GetMapping
    public List<Gusto> getAll() {
        return gustoService.findAll();
    }

    // GET /api/gustos/activos -> Devuelve solo los disponibles para el público
    @GetMapping("/activos")
    public List<Gusto> getAllActive() {
        return gustoService.findAllActive();
    }

    // POST /api/gustos -> Crea un nuevo gusto (Recibe el JSON en el cuerpo)
    @PostMapping
    public Gusto create(@RequestBody Gusto gusto) {
        return gustoService.save(gusto);
    }

    // PUT /api/gustos/{id}/toggle -> Activa/Desactiva un gusto
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Gusto> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(gustoService.toggleActive(id));
    }

    // PUT /api/gustos/{id}/stock -> Actualiza stock
    @PutMapping("/{id}/stock")
    public ResponseEntity<Gusto> toggleStock(@PathVariable Long id) {
        return ResponseEntity.ok(gustoService.toggleStock(id));
    }

    // PUT /api/gustos/{id} -> Actualiza datos generales (Nombre, Desc, Categoria)
    @PutMapping("/{id}")
    public ResponseEntity<Gusto> update(@PathVariable Long id, @RequestBody Gusto gusto) {
        return ResponseEntity.ok(gustoService.update(id, gusto));
    }
}
