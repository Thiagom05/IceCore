package com.heladeria.icecore.pedidos.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.heladeria.icecore.catalogo.entity.Gusto;
import com.heladeria.icecore.catalogo.entity.TipoProducto;
import com.heladeria.icecore.catalogo.repository.GustoRepository;
import com.heladeria.icecore.catalogo.repository.TipoProductoRepository;
import com.heladeria.icecore.pedidos.DTO.ItemPedidoDTO;
import com.heladeria.icecore.pedidos.DTO.PedidoDTO;
import com.heladeria.icecore.pedidos.entity.ItemPedido;
import com.heladeria.icecore.pedidos.entity.Pedido;
import com.heladeria.icecore.pedidos.repository.PedidoRepository;

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

    @Transactional
    public Pedido crearPedido(PedidoDTO pedidoDTO) {

        Pedido pedido = new Pedido();
        pedido.setNombreCliente(pedidoDTO.getNombreCliente());
        pedido.setApellidoCliente(pedidoDTO.getApellidoCliente());
        pedido.setDireccion(pedidoDTO.getDireccion());
        pedido.setTelefono(pedidoDTO.getTelefono());
        pedido.setMetodoPago(pedidoDTO.getMetodoPago());
        pedido.setHoraEntrega(pedidoDTO.getHoraEntrega());

        BigDecimal total = BigDecimal.ZERO;
        List<ItemPedido> items = new ArrayList<>();

        for (ItemPedidoDTO itemDTO : pedidoDTO.getItems()) {

            TipoProducto tipo = tipoProductoRepository.findById(itemDTO.getTipoProductoId())
                    .orElseThrow(() -> new RuntimeException("Tipo de producto no encontrado"));

            // Validacion de cantidad minima para porciones
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

            List<Gusto> gustos = gustoRepository.findAllById(itemDTO.getGustoIds());

            if (gustos.size() != itemDTO.getGustoIds().size()) {
                throw new RuntimeException("Error: Uno o más gustos no existen.");
            }

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setTipoProducto(tipo);
            item.setGustos(gustos);
            item.setCantidad(itemDTO.getCantidad());

            // Calculamos subtotal: Precio x Cantidad
            BigDecimal subtotal = tipo.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()));
            item.setSubtotal(subtotal);

            items.add(item);
            total = total.add(subtotal); // Sumamos al total general
        }

        // --- VALIDACIONES GLOBALES DE CANTIDAD ---
        long totalCuartoKilo = items.stream()
                .filter(i -> {
                    String nombre = i.getTipoProducto().getNombre().trim();
                    return "1/4 KILO".equalsIgnoreCase(nombre) || "1/4 Kilo".equalsIgnoreCase(nombre);
                })
                .mapToInt(ItemPedido::getCantidad)
                .sum();

        int totalProductos = items.stream()
                .mapToInt(ItemPedido::getCantidad)
                .sum();

        if (totalProductos == 1 && totalCuartoKilo == 1) {
            throw new RuntimeException(
                    "Error: No se puede realizar un pedido de un único 1/4 Kilo. Debes agregar más productos.");
        }

        pedido.setItems(items);
        pedido.setPrecioTotal(total);

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
    private com.heladeria.icecore.auth.repository.RepartidorRepository repartidorRepository;

    public com.heladeria.icecore.auth.entity.Repartidor findRepartidorByName(String nombre) {
        return repartidorRepository.findAll().stream()
                .filter(r -> r.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElse(null);
    }

    public Pedido updateRepartidor(Long id, String nombreRepartidor) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado id: " + id));

        if (nombreRepartidor != null && !nombreRepartidor.isEmpty()) {
            com.heladeria.icecore.auth.entity.Repartidor rep = findRepartidorByName(nombreRepartidor);
            if (rep == null) {
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
