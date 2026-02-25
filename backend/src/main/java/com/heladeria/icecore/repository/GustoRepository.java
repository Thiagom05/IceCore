package com.heladeria.icecore.repository;

import com.heladeria.icecore.entity.Gusto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// JpaRepository<Entidad, TipoID>
// Esto nos da GRATIS métodos como: save(), findAll(), findById(), deleteById(), etc.
public interface GustoRepository extends JpaRepository<Gusto, Long> {

    // Solo con definir el nombre del método, Spring crea la consulta SQL por
    // nosotros.

    // Buscar todos los gustos que tengan activo = true
    List<Gusto> findByActivoTrue();

    // Busca un gusto con el mismo nombre (ignorando mayúsculas) pero DIFERENTE id
    // → Permite validar unicidad al editar sin colisionar con el propio registro
    java.util.Optional<Gusto> findByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
