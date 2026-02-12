package com.heladeria.icecore.repository;

import com.heladeria.icecore.entity.DeliveryRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryRoundRepository extends JpaRepository<DeliveryRound, Long> {
    List<DeliveryRound> findByStatus(String status);

    List<DeliveryRound> findByRepartidorIdAndStatus(Long repartidorId, String status);
}
