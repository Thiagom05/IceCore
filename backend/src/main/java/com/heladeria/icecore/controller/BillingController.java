package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.BillingSettings;
import com.heladeria.icecore.entity.Invoice;
import com.heladeria.icecore.entity.Pedido;
import com.heladeria.icecore.repository.PedidoRepository;
import com.heladeria.icecore.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*") // Para desarrollo
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping("/settings")
    public ResponseEntity<BillingSettings> getSettings() {
        return ResponseEntity.ok(billingService.getSettings());
    }

    @PostMapping("/settings")
    public ResponseEntity<BillingSettings> updateSettings(@RequestBody BillingSettings settings) {
        return ResponseEntity.ok(billingService.updateSettings(settings));
    }

    // Endpoint para forzar la facturación (simulada) de un pedido
    @PostMapping("/process/{pedidoId}")
    public ResponseEntity<Invoice> processBilling(@PathVariable Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return ResponseEntity.ok(billingService.processOrderBilling(pedido)); // Por ahora usa la lógica automática,
                                                                              // luego podemos forzar parámetros
    }

    // Endpoint para dashboard: obtener estadísticas (mock por ahora)
    // En una implementación real, esto devolvería DTOs con totales
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam(defaultValue = "daily") String period) {
        return ResponseEntity.ok(billingService.getStats(period));
    }
}
