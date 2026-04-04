<div align="center">
  <h1>IceCore</h1>
  <p><strong>Plataforma integral de e-commerce y gestión para heladerías artesanales</strong></p>
</div>

<br />

IceCore es una solución completa de comercio electrónico diseñada específicamente para heladerías. Consta de una aplicación cliente moderna, interactiva y responsiva para que los usuarios realicen pedidos de forma intuitiva, y un sólido sistema de administración backend para gestionar el catálogo, el inventario y procesar los pagos.

## Características Principales

*   **Catálogo Dinámico e Interactivo:** Visualización en tiempo real de sabores, formatos y precios utilizando animaciones fluidas.
*   **Carrito y Checkout Completo:** Flujo de compra optimizado con cálculo automático de totales.
*   **Integración de Mercado Pago:** Creación de preferencias de pago automatizadas a través del SDK oficial para Argentina.
*   **Notificaciones Inteligentes por WhatsApp:** Generación automática de mensajes con el detalle completo del pedido listos para ser enviados al comercio.
*   **Seguridad y Autenticación:** Sistema de login seguro basado en JSON Web Tokens (JWT) y Spring Security.
*   **Arquitectura Distribuida:** Clara separación de responsabilidades entre el cliente SPA y la API RESTful.

---

## Novedades en v1.0.1

Esta versión formaliza el paso a producción con mejoras críticas de seguridad y transaccionalidad:

**Lo que sumamos y mejoramos:**
*   **Flujo de Pago Transaccional:** Ahora los pedidos se persisten de forma segura en la base de datos de PostgreSQL *antes* de derivar al usuario a Mercado Pago, garantizando cero pérdida de datos ante desconexiones.
*   **Validación Estricta en el Checkout:** Nueva lógica de negocio que bloquea carritos inconsistentes (ej. superación del límite estricto de gustos para pote de 1/4 kg).
*   **Seguridad JWT Reforzada:** Implementación completa del filtro `JwtAuthFilter` y securización total de las rutas de la API, separando férreamente rutas públicas (catálogo) de privadas (admin, checkout).
*   **Gestión de Tiempos Perfeccionada:** El Dashboard de Administrador ahora calcula y muestra fechas relativas dinámicas para pedidos actuales e históricos.

---

## Stack Tecnológico

### Frontend
Desarrollado con enfoque en rendimiento y experiencia de usuario (UX/UI).
*   **Framework:** [React 19](https://react.dev/) montado sobre [Vite](https://vitejs.dev/) para un Hot-Module-Replacement ultra rápido.
*   **Gestión de Estado Centralizada:** Manejo del estado global con Context API (`CartContext`), incorporando lógica de validación dura de negocio en tiempo real (límites de unidades, capacidad máxima por formato) sincronizada de forma robusta localmente.
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) / Vanilla CSS.
*   **Enrutamiento:** `react-router-dom` v7 para navegación sin recarga de página.
*   **Llamadas a la API:** `axios` configurado con interceptores para manejo centralizado de errores.

### Backend (API RESTful)
Arquitectura en capas (Controller, Service, Repository) fuertemente tipada y escalable.
*   **Lenguaje & Framework:** Java 21 + [Spring Boot 3](https://spring.io/projects/spring-boot).
*   **Persistencia:** Spring Data JPA (Hibernate) conectado a **PostgreSQL**.
*   **Seguridad:** Spring Boot Security 6 con filtro custom `JwtAuthFilter`. Arquitectura de autenticación 100% *stateless* para blindar endpoints críticos, validación estricta de roles, y protección sólida del flujo de pagos y panel de control.
*   **Pasarela de Pago:** `mercadopago-sdk-java` para orquestación de pagos.
*   **Herramientas adicionales:** Lombok para reducción de boilerplate y Maven como gestor de dependencias.

---

## Instalación y Despliegue Local

Para ejecutar este proyecto en tu entorno local necesitas tener instalados **Node.js (v18+)**, **Java 21**, **Maven** y **PostgreSQL**.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/IceCore.git
cd IceCore
```

### 2. Configurar y levantar la API Backend
Configura la base de datos PostgreSQL y las credenciales de Mercado Pago. Puedes modificar `application.properties` o usar variables de entorno.
```bash
cd backend
# Levantar el servidor de desarrollo de Spring Boot
./mvnw spring-boot:run
```
> **Nota:** La API correrá por defecto en `http://localhost:8080`

### 3. Configurar y levantar el Cliente Web Frontend
Abre una nueva terminal para no detener el backend.
```bash
cd frontend
# 1. Instalar dependencias puras
npm install

# 2. Configurar variables de entorno copiando el archivo de ejemplo
cp .env.example .env.local
# (Opcional) Edita .env.local para añadir tu número de WhatsApp para testeos.

# 3. Iniciar entorno de desarrollo
npm run dev
```
> **Nota:** El cliente estará disponible generalmente en `http://localhost:5173`

---

## Organización del Código

*   **/backend/src/main/java/com/heladeria/icecore:**
    *   `/auth`: Gestión de seguridad, usuarios, JSON Web Tokens y control de acceso.
    *   `/catalogo`: Todo lo referente a los productos a la venta, gustos de helado y formatos.
    *   `/pedidos`: Lógica core del negocio: creación de órdenes, carritos, estados del pedido e integraciones de pago.
    *   `/negocio`: (Si hay lógica de facturación/dashboard general ajena a un solo pedido).
    *   `/config`: Configuraciones transversales obligatorias de Spring Boot.

Mientras que en el cliente:
*   **/frontend/src:**
    *   `/components`: Componentes atómicos reusables y partes estructurales de interfaz.
    *   `/context`: Providers globales (ej. CartContext).
    *   `/pages`: Vistas por ruta de la aplicación.
    *   `/config`: Configuraciones base como los interceptores de Axios.

---


