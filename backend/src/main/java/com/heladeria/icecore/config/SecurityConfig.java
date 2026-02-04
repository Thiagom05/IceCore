package com.heladeria.icecore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Deshabilitamos CSRF porque usaremos JWT o seremos stateless (y para facilitar
                // pruebas ahora)
                .csrf(csrf -> csrf.disable())
                // Activamos CORS para que el Frontend (React) pueda llamarnos
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Definimos las reglas de quién puede ver qué
                .authorizeHttpRequests(auth -> auth
                        // PÚBLICO: Ver gustos, tipos de producto y crear pedidos
                        .requestMatchers("/api/gustos", "/api/gustos/activos", "/api/tipos-producto").permitAll()
                        .requestMatchers("/api/pedidos").permitAll() // Crear pedido es público
                        .requestMatchers("/api/payments/**").permitAll() // Pagos públicos
                        // ADMIN: Todo lo demás requiere autenticación
                        .anyRequest().authenticated())
                // Usamos Basic Auth por ahora (la ventanita del navegador o Header
                // Authorization: Basic ...)
                .httpBasic(basic -> {
                });

        return http.build();
    }

    // Configuración de CORS (Permitir que React se conecte)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration
                .setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")); // Puertos
                                                                                                                        // comunes
                                                                                                                        // de
                                                                                                                        // Vite/React
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Usuario Admin en Memoria (Para probar sin base de datos de usuarios todavía)
    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder().encode("admin123"))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }
}
