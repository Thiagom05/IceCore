package com.heladeria.icecore.config;

import com.heladeria.icecore.auth.entity.Usuario;
import com.heladeria.icecore.auth.repository.UsuarioRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Usuario admin = usuarioRepository.findByUsername("puravida").orElse(new Usuario());
            admin.setUsername("puravida");
            admin.setPassword(passwordEncoder.encode("puravida2026"));
            admin.setRole("ADMIN");
            usuarioRepository.save(admin);
        };
    }
}
