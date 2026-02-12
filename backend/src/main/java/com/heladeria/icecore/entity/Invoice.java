package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "pedido_id")
    @JsonIgnore
    private Pedido pedido;

    private String tipoFactura; // "A", "B", "C"

    // En simulación, estos serán generados internamente
    private String cae;
    private LocalDateTime vtoCae;
    private Long numeroFactura;

    // "FISCAL" (Declarado) o "INTERNAL" (Negro/Interno)
    // Aunque técnicamente una "Invoice" suele ser fiscal,
    // usaremos esto para rastrear qué pedidos fueron "blanqueados" en el sistema.
    private String status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
