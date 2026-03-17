package com.heladeria.icecore.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Endpoint simple para verificar si las credenciales son válidas.
    // Si Spring Security deja pasar la petición hasta acá, es que el usuario está
    // autenticado.
    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(Principal principal) {
        return ResponseEntity.ok("Authenticated as " + principal.getName());
    }
}
