package com.heladeria.icecore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Inyectamos a nuestro Guardia (Paso 2)
    private final JwtAuthFilter jwtAuthFilter;

    // Leemos el URL del frontend desde los properties (o usamos uno por defecto si
    // no lo encuentra)
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Desactivamos CSRF (Cross-Site Request Forgery) porque usaremos JWT
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Activamos CORS para permitir peticiones desde React (le pasamos la
                // configuración de abajo)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. MAPA DE REGLAS: ¿Qué URLs son públicas y cuáles privadas?
                .authorizeHttpRequests(auth -> auth
                        // Rutas donde no se pide login (permitAll):
                        .requestMatchers("/api/auth/**").permitAll() // Login, Registro, etc.
                        .requestMatchers(HttpMethod.GET, "/api/gustos/**").permitAll() // Ver gustos
                        .requestMatchers(HttpMethod.GET, "/api/tipos-producto/**").permitAll() // Ver tipos de pote
                        .requestMatchers(HttpMethod.GET, "/api/horarios/**").permitAll() // Ver horarios
                        .requestMatchers(HttpMethod.POST, "/api/pedidos").permitAll() // Hacer un pedido
                        .requestMatchers(HttpMethod.POST, "/api/pagos/**").permitAll() // Pagar por MercadoPago

                        // CUALQUIER otra ruta que no esté en la lista de arriba requiere token JWT
                        .anyRequest().authenticated())

                // 4. LE DECIMOS A SPRING QUE ESTA ES UNA APP "SIN ESTADO" (STATELESS)
                // Ya no recordará la sesión del usuario en memoria; cada petición debe traer el
                // Token completo.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. PONEMOS A NUESTRO GUARDIA JWT EN LA PUERTA
                // "addFilterBefore" asegura que el Guardia revise el Token ANTES del chequeo
                // por defecto de contraseña.
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- CONFIGURACIÓN DE CORS ---
    // Reglas estrictas de quién puede llamar a nuestro backend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Solo el dominio especificado en application.properties tiene permiso
        configuration.setAllowedOrigins(List.of(frontendUrl));
        // Métodos permitidos
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        // Encabezados especiales permitidos (importante para enviar el 'Authorization:
        // Bearer...')
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // Permite envío de cookies y credenciales entre dominios
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar estas reglas de CORS absolutamente a todas las rutas ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
