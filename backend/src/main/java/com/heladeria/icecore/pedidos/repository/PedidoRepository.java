package com.heladeria.icecore.pedidos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.heladeria.icecore.pedidos.entity.Pedido;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Método para filtrar pedidos por su estado (ej: "PENDIENTE", "ENTREGADO")
    // SQL generado: SELECT * FROM pedidos WHERE estado = ?
    List<Pedido> findByEstado(String estado);

    List<Pedido> findByFechaAfter(java.time.LocalDateTime fecha);
}
