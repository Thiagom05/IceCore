package com.heladeria.icecore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

// Representa un ítem dentro del pedido (ej: 1 Pote de 1kg con Chocolate y Vainilla)
@Entity
@Data
@Table(name = "items_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELACIÓN MUCHOS A UNO (ManyToOne)
    // Muchos items pertenecen a UN pedido.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id") // Nombre de la columna en la tabla DB que une con pedido
    @JsonIgnore // <--- EVITA EL BUCLE INFINITO AL CONVERTIR A JSON
    private Pedido pedido;

    // Muchos items pueden ser del mismo TipoProducto (ej: muchos clientes compran
    // 1kg)
    @ManyToOne
    @JoinColumn(name = "tipo_producto_id")
    private TipoProducto tipoProducto;

    // RELACIÓN MUCHOS A MUCHOS (ManyToMany)
    // Un item (pote) tiene muchos gustos.
    // Un gusto (Chocolate) puede estar en muchos items (potes de distintos
    // clientes).
    @ManyToMany
    @JoinTable(name = "item_pedido_gustos", // Tabla intermedia que crea JPA automáticamente
            joinColumns = @JoinColumn(name = "item_pedido_id"), inverseJoinColumns = @JoinColumn(name = "gusto_id"))
    private List<Gusto> gustos;

    private int cantidad; // Por si piden 2 potes EXACTAMENTE iguales

    private BigDecimal subtotal; // Precio de este item (tipo * cantidad)
}
