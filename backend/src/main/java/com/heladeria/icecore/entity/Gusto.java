package com.heladeria.icecore.entity;

import jakarta.persistence.*;
import lombok.Data;

// @Entity: Le dice a Spring Boot que esta clase representa una tabla en la base de datos.
// Cada "objeto" de esta clase será una fila en la tabla.
@Entity
// @Data: Una utilidad de Lombok que genera automáticamente los getters, setters
// y otros métodos
// necesarios para que no tengamos que escribirlos manualmente.
@Data
// @Table: Define el nombre exacto de la tabla en la base de datos (por defecto
// sería "gusto").
@Table(name = "gustos")
public class Gusto {

    // @Id: Indica que este campo es la Clave Primaria (Primary Key) de la tabla.
    @Id
    // @GeneratedValue: Indica que el valor se genera automáticamente
    // (autoincremental).
    // IDENTITY significa que la base de datos se encarga de asignar el número (1,
    // 2, 3...).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campos normales que se convertirán en columnas de la tabla.
    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
    @Column(name = "descripcion")
    private String descripcion;
    @Column(name = "categoria", nullable = false)
    private String categoria;
    @Column(name = "hay_stock")
    private boolean hayStock = true;

    // Campo para saber si está disponible o no (soft delete o deshabilitado
    // temporalmente)
    // El valor por defecto es true (activo)
    @Column(name = "activo")
    private boolean activo = true;
}
