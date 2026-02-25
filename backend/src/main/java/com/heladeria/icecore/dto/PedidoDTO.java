package com.heladeria.icecore.dto;

import lombok.Data;
import java.util.List;

@Data
public class PedidoDTO {

    // Datos del cliente
    private String nombreCliente;
    private String apellidoCliente;
    private String direccion;
    private String telefono;
    private String metodoPago;
    private String horaEntrega; // Franja horaria elegida por el cliente

    // La lista de ítems (potes) que está pidiendo
    private List<ItemPedidoDTO> items;
}
