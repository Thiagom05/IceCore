package com.heladeria.icecore.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.heladeria.icecore.auth.entity.Repartidor;

import java.util.List;

public interface RepartidorRepository extends JpaRepository<Repartidor, Long> {
    List<Repartidor> findByActivoTrue();
}
