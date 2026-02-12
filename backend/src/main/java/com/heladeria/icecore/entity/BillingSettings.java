package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "billing_settings")
public class BillingSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Porcentaje de facturación objetivo (0 a 100)
    // Ejemplo: 40 significa "intentar facturar el 40% del total"
    @Column(name = "target_percentage")
    private int targetPercentage = 0;

    // Datos fiscales del comercio (para la impresión del ticket fiscal simulado)
    private String businessName;
    private String cuit;
    private String address;
    private String startActivityDate;
    private String grossIncomeNumber; // Ingresos Brutos
    private int salesPoint; // Punto de Venta
}
