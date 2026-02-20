package com.heladeria.icecore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.heladeria.icecore.dto.ItemPedidoDTO;
import com.heladeria.icecore.dto.PedidoDTO;
import com.heladeria.icecore.entity.Gusto;
import com.heladeria.icecore.entity.ItemPedido;
import com.heladeria.icecore.entity.Pedido;
import com.heladeria.icecore.entity.TipoProducto;
import com.heladeria.icecore.repository.GustoRepository;
import com.heladeria.icecore.repository.PedidoRepository;
import com.heladeria.icecore.repository.TipoProductoRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private TipoProductoRepository tipoProductoRepository;

    @Autowired
    private GustoRepository gustoRepository;

    // @Transactional: Asegura que si algo falla a mitad de camino, NO se guarde
    // nada en la BD (rollback).
    @Transactional
    public Pedido crearPedido(PedidoDTO pedidoDTO) {

        // 1. Creamos el objeto Pedido vacío
        Pedido pedido = new Pedido();
        pedido.setNombreCliente(pedidoDTO.getNombreCliente());
        pedido.setApellidoCliente(pedidoDTO.getApellidoCliente());
        pedido.setDireccion(pedidoDTO.getDireccion());
        pedido.setTelefono(pedidoDTO.getTelefono());
        pedido.setMetodoPago(pedidoDTO.getMetodoPago());

        BigDecimal total = BigDecimal.ZERO;
        List<ItemPedido> items = new ArrayList<>();

        // 2. Recorremos los ítems que nos mandaron (los potes)
        for (ItemPedidoDTO itemDTO : pedidoDTO.getItems()) {

            // Buscamos el tipo de producto en la BD
            TipoProducto tipo = tipoProductoRepository.findById(itemDTO.getTipoProductoId())
                    .orElseThrow(() -> new RuntimeException("Tipo de producto no encontrado"));

            if ("1/4 KILO".equalsIgnoreCase(tipo.getNombre())) {
                if (itemDTO.getCantidad() < 2) {
                    throw new RuntimeException("Error: El producto " + tipo.getNombre()
                            + " requiere al menos 2 unidades.");
                }
            }

            if (!tipo.getEsPorPeso()) {
                if (itemDTO.getCantidad() < 5) {
                    throw new RuntimeException("Error: El producto " + tipo.getNombre()
                            + " requiere al menos 5 unidades.");
                }
            }

            // --- LÓGICA DE NEGOCIO PRINCIPAL ---
            // Validamos que la cantidad de gustos elegidos no supere la capacidad del pote
            if (itemDTO.getGustoIds().size() > tipo.getMaxGustos()) {
                throw new RuntimeException("Error: El producto " + tipo.getNombre()
                        + " solo permite " + tipo.getMaxGustos() + " gustos.");
            }

            // Buscamos todos los gustos elgidos en la BD
            List<Gusto> gustos = gustoRepository.findAllById(itemDTO.getGustoIds());

            // Validamos que existan todos
            if (gustos.size() != itemDTO.getGustoIds().size()) {
                throw new RuntimeException("Error: Uno o más gustos no existen.");
            }

            // (Opcional) Validar stock o si están activos aquí

            // Creamos el ItemPedido real
            ItemPedido item = new ItemPedido();
            item.setPedido(pedido); // Vinculamos con el padre
            item.setTipoProducto(tipo);
            item.setGustos(gustos);
            item.setCantidad(itemDTO.getCantidad());

            // Calculamos subtotal: Precio x Cantidad
            BigDecimal subtotal = tipo.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()));
            item.setSubtotal(subtotal);

            items.add(item);
            total = total.add(subtotal); // Sumamos al total general
        }

        // 3. Asignamos los items y el precio total al pedido
        pedido.setItems(items);
        pedido.setPrecioTotal(total);

        // 4. Guardamos todo en la BD
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    public Pedido updateEstado(Long id, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado id: " + id));
        pedido.setEstado(nuevoEstado);
        return pedidoRepository.save(pedido);
    }

    @Autowired
    private com.heladeria.icecore.repository.RepartidorRepository repartidorRepository;

    public com.heladeria.icecore.entity.Repartidor findRepartidorByName(String nombre) {
        // Implement logic to find repartidor by name if needed, or change
        // updateRepartidor logic
        // For simplicity, let's assume updateRepartidor now takes ID or we find by name
        return repartidorRepository.findAll().stream()
                .filter(r -> r.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElse(null);
    }

    public Pedido updateRepartidor(Long id, String nombreRepartidor) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado id: " + id));

        if (nombreRepartidor != null && !nombreRepartidor.isEmpty()) {
            com.heladeria.icecore.entity.Repartidor rep = findRepartidorByName(nombreRepartidor);
            if (rep == null) {
                // If not found, maybe create or throw? For now, throw.
                throw new RuntimeException("Repartidor no encontrado: " + nombreRepartidor);
            }
            pedido.setRepartidor(rep);
            pedido.setEstado("EN_CAMINO");
        } else {
            pedido.setRepartidor(null);
        }

        return pedidoRepository.save(pedido);
    }
}
