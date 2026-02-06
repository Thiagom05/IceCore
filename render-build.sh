#!/usr/bin/env bash
# Exit on error
set -o errexit

# Navegar al directorio del backend
cd backend

# Dar permisos de ejecución al wrapper de Maven
chmod +x mvnw

# Ejecutar el build de Maven
./mvnw clean package -DskipTests
