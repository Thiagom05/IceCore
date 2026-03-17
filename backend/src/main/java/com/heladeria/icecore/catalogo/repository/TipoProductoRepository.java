package com.heladeria.icecore.catalogo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.heladeria.icecore.catalogo.entity.TipoProducto;

public interface TipoProductoRepository extends JpaRepository<TipoProducto, Long> {
}
