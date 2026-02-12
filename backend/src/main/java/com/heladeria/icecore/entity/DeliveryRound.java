package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "delivery_rounds")
public class DeliveryRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "repartidor_id")
    private Repartidor repartidor;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // EN_CURSO, FINALIZADA
    private String status;

    private BigDecimal totalAmount;

    // Lo que debe rendir a la caja (Solo EFECTIVO)
    private BigDecimal cashToRender;
}
