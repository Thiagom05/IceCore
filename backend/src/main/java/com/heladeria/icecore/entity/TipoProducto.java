package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

// Esta entidad representa los formatos de venta (Potes, Cucuruchos, etc.)
@Entity
@Data
@Table(name = "tipos_producto")
public class TipoProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del producto: "1 Kilo", "1/2 Kilo", "Cucurucho"
    @Column(nullable = false)
    private String nombre;

    // Cuántos gustos entran en este producto.
    // Ej: 1kg -> 4 gustos, 1/4kg -> 3 gustos.
    @Column(name = "capacidad_sabores", nullable = false)
    private Integer maxGustos;

    // Usamos BigDecimal para dinero porque los 'double' o 'float' tienen problemas
    // de precisión con decimales.
    @Column(nullable = false)
    private BigDecimal precio;

    // Peso aproximado para calcular stock (opcional si es por unidad)
    private Integer pesoGramos;

    // Si es "por peso" (pote) o "por unidad" (palito helado, bombón)
    // Esto nos servirá en el frontend para saber si mostrar selector de gustos o
    // no.
    private Boolean esPorPeso; // true=Pote (usa gustos), false=Unidad (es el producto en sí)
}
