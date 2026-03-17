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

## Stack Tecnológico

### Frontend
Desarrollado con enfoque en rendimiento y experiencia de usuario (UX/UI).
*   **Framework:** [React 19](https://react.dev/) montado sobre [Vite](https://vitejs.dev/) para un Hot-Module-Replacement ultra rápido.
*   **Gestión de Estado y UX Avanzada:** Técnicas de **Optimistic UI (Carga de Latencia Cero)** implementadas mediante Context API para presentar el catálogo estático instantáneamente mitigando Cold Starts del backend, y sincronizando el `localStorage` en segundo plano.
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) / Vanilla CSS.
*   **Enrutamiento:** `react-router-dom` v7 para navegación sin recarga de página.
*   **Llamadas a la API:** `axios` configurado con interceptores para manejo centralizado de errores.

### Backend (API RESTful)
Arquitectura en capas (Controller, Service, Repository) fuertemente tipada y escalable.
*   **Lenguaje & Framework:** Java 21 + [Spring Boot 3](https://spring.io/projects/spring-boot).
*   **Persistencia:** Spring Data JPA (Hibernate) conectado a **PostgreSQL**.
*   **Seguridad:** Spring Security + `jjwt` para autenticación sin estado (Stateless).
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


