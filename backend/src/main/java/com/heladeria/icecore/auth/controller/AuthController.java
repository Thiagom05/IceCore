package com.heladeria.icecore.auth.controller;

import com.heladeria.icecore.auth.DTO.AuthResponseDTO;
import com.heladeria.icecore.auth.DTO.LoginRequestDTO;
import com.heladeria.icecore.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // El "Jefe de Autenticación" que configuramos en AppConfig
    private final AuthenticationManager authenticationManager;
    // Para ir a buscar a tu empleado/usuario a la Base de Datos
    private final UserDetailsService userDetailsService;
    // Nuestra "Máquina de pases VIP" del Paso 1
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        // 1. Spring pide verificar si la contraseña coincide con el usuario en la BD.
        // Si el usuario no existe o la clave es incorrecta, tira BadCredentialsException automáticamente.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. Si superó la prueba de arriba, buscamos todos los datos del usuario (rol, id, etc)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 3. Fabricamos un nuevo "Pase VIP" cifrado (Token) a su nombre
        String jwtToken = jwtService.generateToken(userDetails);

        // 4. Lo empaquetamos y se lo devolvemos al frontend en un objeto JSON
        return ResponseEntity.ok(AuthResponseDTO.builder().token(jwtToken).build());
    }
}
