package com.heladeria.icecore.service;

import com.heladeria.icecore.entity.Horarios;
import com.heladeria.icecore.repository.HorariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HoraiosService {

    @Autowired
    private HorariosRepository businessHoursRepository;

    // Siempre usamos el registro con id=1 (singleton)
    public Horarios getHours() {
        return businessHoursRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(this::createDefault);
    }

    public Horarios save(Horarios hours) {
        // Aseguramos que siempre sea el mismo registro (singleton)
        List<Horarios> existing = businessHoursRepository.findAll();
        if (!existing.isEmpty()) {
            hours.setId(existing.get(0).getId());
        }
        return businessHoursRepository.save(hours);
    }

    // Crea el horario por defecto si no existe ninguno en la DB
    private Horarios createDefault() {
        Horarios defaults = new Horarios();
        return businessHoursRepository.save(defaults);
    }
}
