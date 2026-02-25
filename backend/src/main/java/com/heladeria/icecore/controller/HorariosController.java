package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.Horarios;
import com.heladeria.icecore.service.HoraiosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-hours")
public class HorariosController {

    @Autowired
    private HoraiosService businessHoursService;

    // GET /api/business-hours -> Devuelve la configuración actual (pública, sin
    // auth)
    @GetMapping
    public ResponseEntity<Horarios> getHours() {
        return ResponseEntity.ok(businessHoursService.getHours());
    }

    // PUT /api/business-hours -> Actualiza la configuración (solo admin)
    @PutMapping
    public ResponseEntity<Horarios> updateHours(@RequestBody Horarios hours) {
        return ResponseEntity.ok(businessHoursService.save(hours));
    }
}
