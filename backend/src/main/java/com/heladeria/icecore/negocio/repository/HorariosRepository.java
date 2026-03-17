package com.heladeria.icecore.negocio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.heladeria.icecore.negocio.entity.Horarios;

@Repository
public interface HorariosRepository extends JpaRepository<Horarios, Long> {
}
