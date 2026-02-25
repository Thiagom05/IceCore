package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "business_hours")
public class Horarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Turno 1 (ej: 11:00 - 15:00)
    // Se almacena en minutos desde medianoche para soportar medias horas
    // 11:00 = 660, 11:30 = 690, 15:00 = 900, etc.
    @Column(name = "apertura_t1")
    private int aperturaT1 = 660; // 11:00

    @Column(name = "cierre_t1")
    private int cierreT1 = 900; // 15:00

    // Turno 2 (ej: 20:00 - 00:00)
    @Column(name = "apertura_t2")
    private int aperturaT2 = 1200; // 20:00

    @Column(name = "cierre_t2")
    private int cierreT2 = 1440; // 00:00 = medianoche (fin del día)

    // Intervalo en minutos entre slots (30 = cada media hora)
    @Column(name = "intervalo_minutos")
    private int intervaloMinutos = 30;
}
