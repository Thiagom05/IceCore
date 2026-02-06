package com.heladeria.icecore.controller;

import com.heladeria.icecore.dto.PedidoDTO;
import com.heladeria.icecore.entity.Pedido;
import com.heladeria.icecore.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin("*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // POST /api/pedidos -> Recibe el DTO complejo y crea el pedido
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PedidoDTO pedidoDTO) {
        try {
            return ResponseEntity.ok(pedidoService.crearPedido(pedidoDTO));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Pedido> getAll() {
        return pedidoService.findAll();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> updateEstado(@PathVariable Long id, @RequestParam String estado) {
        return ResponseEntity.ok(pedidoService.updateEstado(id, estado));
    }

    @PatchMapping("/{id}/repartidor")
    public ResponseEntity<Pedido> updateRepartidor(@PathVariable Long id, @RequestParam String nombre) {
        return ResponseEntity.ok(pedidoService.updateRepartidor(id, nombre));
    }
}
