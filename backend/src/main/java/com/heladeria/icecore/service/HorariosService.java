package com.heladeria.icecore.service;

import com.heladeria.icecore.entity.Horarios;
import com.heladeria.icecore.repository.HorariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HorariosService {

    @Autowired
    private HorariosRepository horariosRepository;

    public Horarios getHours() {
        return horariosRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(this::createDefault);
    }

    public Horarios save(Horarios hours) {
        List<Horarios> existing = horariosRepository.findAll();
        if (!existing.isEmpty()) {
            hours.setId(existing.get(0).getId());
        }
        return horariosRepository.save(hours);
    }

    private Horarios createDefault() {
        Horarios defaults = new Horarios();
        return horariosRepository.save(defaults);
    }
}
