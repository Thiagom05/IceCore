#!/usr/bin/env bash
# Exit on error
set -o errexit

# Intentar detectar JAVA_HOME si no está seteadas
if [ -z "$JAVA_HOME" ]; then
    # Ubicaciones comunes en imágenes de Render / Linux
    if [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
    elif [ -d "/usr/lib/jvm/default-java" ]; then
        export JAVA_HOME="/usr/lib/jvm/default-java"
    fi
    export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Using JAVA_HOME: $JAVA_HOME"
echo "Java Version:"
java -version

# Navegar al directorio del backend
cd backend

# Dar permisos de ejecución al wrapper de Maven
chmod +x mvnw

# Ejecutar el build de Maven
./mvnw clean package -DskipTests
