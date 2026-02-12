package com.heladeria.icecore.config;

import com.heladeria.icecore.entity.Usuario;
import com.heladeria.icecore.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verificar si existe el admin, si no, crearlo
            if (usuarioRepository.findByUsername("admin").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                usuarioRepository.save(admin);
                System.out.println(">>> Usuario ADMIN creado por defecto: admin / admin123");
            }
        };
    }
}
