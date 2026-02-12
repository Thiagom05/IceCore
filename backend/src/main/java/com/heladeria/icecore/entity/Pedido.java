package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Datos del Cliente (Podríamos tener una entidad Cliente separada,
    // pero para empezar simple lo guardamos aquí)
    private String nombreCliente;
    private String apellidoCliente;
    private String direccion;
    private String telefono;

    private String metodoPago; // "Efectivo", "MP", etc.

    // Estado del pedido para el Admin
    private String estado; // "PENDIENTE", "EN_CAMINO", "ENTREGADO"

    private BigDecimal precioTotal;

    // @Column(name = "repartidor")
    // private String repartidor;

    @ManyToOne
    @JoinColumn(name = "repartidor_id")
    private Repartidor repartidor;

    @ManyToOne
    @JoinColumn(name = "delivery_round_id")
    private DeliveryRound deliveryRound;

    // Fecha y hora automática
    private LocalDateTime fecha;

    // RELACIÓN UNO A MUCHOS (OneToMany)
    // Un Pedido tiene MUCHOS items (potes).
    // "mappedBy" le dice a JPA que la otra clase (ItemPedido) es la dueña de la
    // relación.
    // "cascade = CascadeType.ALL" significa que si borro el pedido, se borran sus
    // items.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> items = new ArrayList<>();

    // Relación con Factura (si existe)
    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    private Invoice invoice;

    // Esto se ejecuta justo antes de guardar en la DB
    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
    }

}
