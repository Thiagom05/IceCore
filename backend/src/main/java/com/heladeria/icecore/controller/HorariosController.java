package com.heladeria.icecore.controller;

import com.heladeria.icecore.entity.Horarios;
import com.heladeria.icecore.service.HorariosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/horarios")
public class HorariosController {

    @Autowired
    private HorariosService horariosService;

    @GetMapping
    public ResponseEntity<Horarios> getHours() {
        return ResponseEntity.ok(horariosService.getHours());
    }

    @PutMapping
    public ResponseEntity<Horarios> updateHours(@RequestBody Horarios hours) {
        return ResponseEntity.ok(horariosService.save(hours));
    }
}
