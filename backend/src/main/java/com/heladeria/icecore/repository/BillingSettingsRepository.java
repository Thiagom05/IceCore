package com.heladeria.icecore.repository;

import com.heladeria.icecore.entity.BillingSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingSettingsRepository extends JpaRepository<BillingSettings, Long> {
}
