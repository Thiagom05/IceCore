package com.heladeria.icecore.pedidos.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.heladeria.icecore.pedidos.DTO.PedidoDTO;
import com.heladeria.icecore.pedidos.entity.Pedido;
import com.heladeria.icecore.pedidos.service.PedidoService;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin("*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

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
}
