package com.heladeria.icecore.service;

import com.heladeria.icecore.entity.BillingSettings;
import com.heladeria.icecore.entity.Invoice;
import com.heladeria.icecore.entity.Pedido;
import com.heladeria.icecore.repository.BillingSettingsRepository;
import com.heladeria.icecore.repository.InvoiceRepository;
import com.heladeria.icecore.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class BillingService {

    @Autowired
    private BillingSettingsRepository settingsRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    public BillingSettings getSettings() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            BillingSettings newSettings = new BillingSettings();
            newSettings.setTargetPercentage(0);
            return settingsRepository.save(newSettings);
        });
    }

    public BillingSettings updateSettings(BillingSettings settings) {
        settings.setId(1L); // Ensure singleton
        return settingsRepository.save(settings);
    }

    // Lógica para decidir si facturar o no un pedido
    public Invoice processOrderBilling(Pedido pedido) {
        BillingSettings settings = getSettings();
        int target = settings.getTargetPercentage();

        // 1. Calcular porcentaje actual de facturación
        // 1. Calcular porcentaje actual de facturación (SOLO DEL DÍA ACTUAL)
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        List<Pedido> pedidosDelDia = pedidoRepository.findByFechaAfter(startOfDay);

        long totalPedidos = pedidosDelDia.size();
        long pedidosFacturados = pedidosDelDia.stream()
                .filter(p -> p.getInvoice() != null && "FISCAL".equals(p.getInvoice().getStatus())).count();

        double currentPercentage = totalPedidos > 0 ? ((double) pedidosFacturados / totalPedidos) * 100 : 0;

        // 2. Decisión
        boolean shouldBill = false;

        // --- LOGICA REFINADA ---
        if (totalPedidos <= 10) {
            // "Arranque Suave": Si hay pocos pedidos, usamos probabilidad pura para no ser
            // agresivos
            // Si target es 10%, tiramos un dado.
            shouldBill = new Random().nextInt(100) < target;
        } else {
            // "Modo Crucero": Compensamos si estamos lejos del objetivo
            if (currentPercentage < target) {
                // Estamos abajo del objetivo: Facturar para subir promedios
                shouldBill = true;
            } else {
                // Estamos pasados: Solo 1% de chance de facturar por error/azar, o 0.
                shouldBill = new Random().nextInt(100) < 1;
            }
        }

        // Crear registro de Invoice
        Invoice invoice = new Invoice();
        invoice.setPedido(pedido);

        if (shouldBill) {
            invoice.setStatus("FISCAL");
            invoice.setTipoFactura("B"); // Consumidor Final por defecto
            invoice.setCae("SIMULATED_CAE_" + System.currentTimeMillis());
            invoice.setNumeroFactura(System.currentTimeMillis() / 1000); // Mock number
            invoice.setVtoCae(LocalDateTime.now().plusDays(10));
        } else {
            invoice.setStatus("INTERNAL");
            invoice.setTipoFactura("X"); // Comanda interna
        }

        return invoiceRepository.save(invoice);
    }

    public java.util.Map<String, Object> getStats(String period) {
        BillingSettings settings = getSettings();

        LocalDateTime startDate;
        if ("monthly".equalsIgnoreCase(period)) {
            startDate = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        } else {
            // Default: daily
            startDate = LocalDateTime.now().toLocalDate().atStartOfDay();
        }

        List<Pedido> pedidos = pedidoRepository.findByFechaAfter(startDate);

        long totalPedidos = pedidos.size();
        long pedidosFacturados = pedidos.stream()
                .filter(p -> p.getInvoice() != null && "FISCAL".equals(p.getInvoice().getStatus()))
                .count();

        double currentPercentage = totalPedidos > 0
                ? ((double) pedidosFacturados / totalPedidos) * 100
                : 0;

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("targetPercentage", settings.getTargetPercentage());
        stats.put("currentPercentage", Math.round(currentPercentage * 10.0) / 10.0);
        stats.put("period", period);
        stats.put("totalOrdersInPeriod", totalPedidos);

        return stats;
    }
}