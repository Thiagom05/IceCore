package com.heladeria.icecore.repository;

import com.heladeria.icecore.entity.Repartidor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepartidorRepository extends JpaRepository<Repartidor, Long> {
    List<Repartidor> findByActivoTrue();
}
