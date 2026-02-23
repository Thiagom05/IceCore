package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.TipoProducto;
import com.heladeria.icecore.service.TipoProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-producto")
@CrossOrigin("*")
public class TipoProductoController {

    @Autowired
    private TipoProductoService tipoProductoService;

    @GetMapping
    public List<TipoProducto> getAll() {
        return tipoProductoService.findAll();
    }

    @PostMapping
    public TipoProducto create(@RequestBody TipoProducto tipoProducto) {
        return tipoProductoService.save(tipoProducto);
    }

    @PutMapping("/{id}")
    public TipoProducto update(@PathVariable Long id, @RequestBody TipoProducto tipoProducto) {
        return tipoProductoService.update(id, tipoProducto);
    }
}
