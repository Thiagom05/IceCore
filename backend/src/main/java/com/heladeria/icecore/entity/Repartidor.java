package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "repartidores")
public class Repartidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String telefono;

    // Para saber si está disponible para asignar
    private boolean activo = true;
}
