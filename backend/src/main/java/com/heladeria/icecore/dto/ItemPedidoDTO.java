package com.heladeria.icecore.dto;

import lombok.Data;
import java.util.List;

// DTO: Data Transfer Object.
// Es una clase simple que sirve solo para transportar datos desde el Frontend hacia aquí.
// No es una entidad de la base de datos.
@Data
public class ItemPedidoDTO {

    // El ID del tipo de producto (ej: ID del "1 Kilo")
    private Long tipoProductoId;

    // La lista de IDs de los gustos que eligió el cliente
    // Ej: [ID_Chocolate, ID_Vainilla, ID_Fresa]
    private List<Long> gustoIds;

    // Cuántos de estos potes quiere (normalmente 1, pero por si acaso)
    private int cantidad;
}
