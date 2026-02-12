package com.heladeria.icecore.service;

import com.heladeria.icecore.entity.Pedido;
import com.heladeria.icecore.entity.Repartidor;
import com.heladeria.icecore.repository.PedidoRepository;
import com.heladeria.icecore.repository.RepartidorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    @Autowired
    private RepartidorRepository repartidorRepository;

    @Autowired
    private com.heladeria.icecore.repository.DeliveryRoundRepository deliveryRoundRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    public List<Repartidor> getAllRepartidores() {
        return repartidorRepository.findAll();
    }

    public List<Repartidor> getActiveRepartidores() {
        return repartidorRepository.findByActivoTrue();
    }

    public Repartidor saveRepartidor(Repartidor repartidor) {
        return repartidorRepository.save(repartidor);
    }

    public void deleteRepartidor(Long id) {
        repartidorRepository.deleteById(id);
    }

    // Calcula cuánto debe rendir cada repartidor (Pedidos entregados en EFECTIVO no
    // rendidos)
    // Nota: Por ahora "no rendido" se asume como todo pedido ENTREGADO en EFECTIVO
    // del día.
    // Para simplificar, asumimos que al final del día se rinde todo.
    public Map<String, Object> getRendicionCaja() {
        List<Repartidor> repartidores = repartidorRepository.findAll();
        List<Pedido> pedidosDelDia = pedidoRepository.findAll(); // TODO: Filtrar por día real en prod

        Map<String, Object> reporte = new HashMap<>();

        List<Map<String, Object>> detalle = repartidores.stream().map(rep -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", rep.getId());
            dto.put("nombre", rep.getNombre());
            // Usamos el id
            List<Pedido> pedidosRepartidor = pedidosDelDia.stream()
                    .filter(p -> p.getRepartidor() != null && rep.getId().equals(p.getRepartidor().getId()))
                    .filter(p -> "EFECTIVO".equalsIgnoreCase(p.getMetodoPago()))
                    .filter(p -> "EN_CAMINO".equals(p.getEstado()) || "ENTREGADO".equals(p.getEstado()))
                    .collect(Collectors.toList());

            BigDecimal totalEfectivo = pedidosRepartidor.stream()
                    .map(Pedido::getPrecioTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            dto.put("totalDeuda", totalEfectivo);
            dto.put("cantidadPedidos", pedidosRepartidor.size());

            return dto;
        }).collect(Collectors.toList());

        reporte.put("repartidores", detalle);
        reporte.put("repartidores", detalle);
        return reporte;
    }

    public com.heladeria.icecore.entity.DeliveryRound createRound(Long repartidorId, List<Long> pedidoIds) {
        Repartidor repartidor = repartidorRepository.findById(repartidorId)
                .orElseThrow(() -> new RuntimeException("Repartidor no encontrado"));

        com.heladeria.icecore.entity.DeliveryRound round = new com.heladeria.icecore.entity.DeliveryRound();
        round.setRepartidor(repartidor);
        round.setStartTime(java.time.LocalDateTime.now());
        round.setStatus("EN_CURSO");

        List<Pedido> pedidos = pedidoIds.stream()
                .map(id -> pedidoRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + id)))
                .collect(Collectors.toList());

        // Calcular totales
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal cash = BigDecimal.ZERO;

        for (Pedido p : pedidos) {
            total = total.add(p.getPrecioTotal());
            if ("EFECTIVO".equalsIgnoreCase(p.getMetodoPago())) {
                cash = cash.add(p.getPrecioTotal());
            }
        }

        round.setTotalAmount(total);
        round.setCashToRender(cash);

        // PRIMERO GUARDAR LA RONDA (Para tener ID)
        round = deliveryRoundRepository.save(round);

        // LUEGO ASIGNAR PEDIDOS
        for (Pedido p : pedidos) {
            // Vincular pedido a la ronda y al repartidor
            p.setDeliveryRound(round);
            p.setRepartidor(repartidor);
            p.setEstado("EN_CAMINO");
            pedidoRepository.save(p);
        }

        return round;
    }

    public List<com.heladeria.icecore.entity.DeliveryRound> getActiveRounds() {
        return deliveryRoundRepository.findByStatus("EN_CURSO");
    }

    public com.heladeria.icecore.entity.DeliveryRound finishRound(Long roundId) {
        com.heladeria.icecore.entity.DeliveryRound round = deliveryRoundRepository.findById(roundId)
                .orElseThrow(() -> new RuntimeException("Ronda no encontrada"));

        round.setEndTime(java.time.LocalDateTime.now());
        round.setStatus("FINALIZADA");

        // Opcional: Marcar pedidos como entregados si no lo estan?
        // Por safety, lo dejamos asi.

        return deliveryRoundRepository.save(round);
    }
}
