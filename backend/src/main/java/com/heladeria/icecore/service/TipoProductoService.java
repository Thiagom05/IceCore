package com.heladeria.icecore.service;

import com.heladeria.icecore.entity.TipoProducto;
import com.heladeria.icecore.repository.TipoProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TipoProductoService {

    @Autowired
    private TipoProductoRepository tipoProductoRepository;

    public List<TipoProducto> findAll() {
        return tipoProductoRepository.findAll();
    }

    public Optional<TipoProducto> findById(Long id) {
        return tipoProductoRepository.findById(id);
    }

    public TipoProducto save(TipoProducto tipoProducto) {
        return tipoProductoRepository.save(tipoProducto);
    }

    public void deleteById(Long id) {
        tipoProductoRepository.deleteById(id);
    }

    public TipoProducto update(Long id, TipoProducto details) {
        TipoProducto producto = tipoProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setNombre(details.getNombre());
        producto.setPrecio(details.getPrecio());
        producto.setMaxGustos(details.getMaxGustos());
        return tipoProductoRepository.save(producto);
    }
}
