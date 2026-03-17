package com.heladeria.icecore.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.heladeria.icecore.auth.entity.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
}
