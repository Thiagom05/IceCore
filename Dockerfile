# Usar una imagen base de Java 21 (la versión que usamos)
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

# Copiar archivos de Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY backend/pom.xml backend/
COPY frontend/package.json frontend/

# Copiar el código fuente
COPY backend/src backend/src
COPY frontend/src frontend/src
COPY frontend/public frontend/public
COPY frontend/index.html frontend/
COPY frontend/vite.config.js frontend/
COPY frontend/postcss.config.js frontend/
COPY frontend/tailwind.config.js frontend/

# Construir el backend
WORKDIR /workspace/app/backend
RUN chmod +x ../mvnw
RUN ../mvnw clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/backend/target
COPY --from=build ${DEPENDENCY}/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
