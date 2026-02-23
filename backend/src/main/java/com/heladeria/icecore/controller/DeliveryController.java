package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.Repartidor;
import com.heladeria.icecore.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repartidores")
@CrossOrigin(origins = "*")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping
    public ResponseEntity<List<Repartidor>> getAll() {
        return ResponseEntity.ok(deliveryService.getAllRepartidores());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Repartidor>> getActive() {
        return ResponseEntity.ok(deliveryService.getActiveRepartidores());
    }

    @PostMapping
    public ResponseEntity<Repartidor> create(@RequestBody Repartidor repartidor) {
        return ResponseEntity.ok(deliveryService.saveRepartidor(repartidor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deliveryService.deleteRepartidor(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/caja")
    public ResponseEntity<Map<String, Object>> getCaja() {
        return ResponseEntity.ok(deliveryService.getRendicionCaja());
    }

    @PostMapping("/rounds")
    public ResponseEntity<?> createRound(@RequestBody CreateRoundRequest request) {
        return ResponseEntity.ok(deliveryService.createRound(request.repartidorId, request.pedidoIds));
    }

    @GetMapping("/rounds/active")
    public ResponseEntity<?> getActiveRounds() {
        return ResponseEntity.ok(deliveryService.getActiveRounds());
    }

    @PutMapping("/rounds/{id}/finish")
    public ResponseEntity<?> finishRound(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.finishRound(id));
    }

    public static class CreateRoundRequest {
        public Long repartidorId;
        public List<Long> pedidoIds;
    }
}
