# 🍦 IceCore — Sistema de Gestión para Heladería

Sistema fullstack de gestión de pedidos para **Pura Vida**, una heladería artesanal. Permite a los clientes armar su pedido online eligiendo productos, sabores y método de pago, y al administrador gestionar pedidos, catálogo, repartidores y facturación desde un panel privado.

## ✨ Funcionalidades

- **Catálogo público** de sabores agrupados por categoría con indicador de stock
- **Pedido online** con flujo de 3 pasos: elegir producto → seleccionar gustos → confirmar
- **Carrito de compras** persistente en localStorage
- **Checkout** con 3 métodos de pago (MercadoPago, Transferencia, Efectivo)
- **Confirmación por WhatsApp** con detalle del pedido formateado
- **Panel Admin** protegido con login (ABM sabores, gestión de pedidos, delivery, facturación)
- **Horarios de negocio** configurables que generan franjas horarias automáticas
- **Facturación inteligente** con porcentaje objetivo configurable
- **Modo Demo/Portfolio** para exhibir sin pagos reales
- **Diseño responsive** optimizado para celulares

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Java** | 21 | Lenguaje principal |
| **Spring Boot** | 4.0.2 | Framework backend |
| **Spring Data JPA** | — | ORM (mapeo objeto-relacional) |
| **Spring Security** | — | Autenticación y autorización |
| **Hibernate** | — | Implementación JPA |
| **PostgreSQL** | — | Base de datos relacional |
| **Lombok** | — | Reducción de boilerplate |
| **Maven** | — | Gestión de dependencias y build |
| **MercadoPago SDK** | 2.1.27 | Integración de pagos |

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 19 | Librería de UI |
| **Vite** | 7 | Bundler y dev server |
| **Tailwind CSS** | 4 | Estilos utility-first |
| **React Router** | 7 | Navegación SPA |
| **Axios** | — | Cliente HTTP |
| **Lucide React** | — | Iconografía |
| **Lenis** | — | Smooth scrolling |

### DevOps
| Tecnología | Uso |
|-----------|-----|
| **Docker** | Contenerización (multi-stage build) |
| **Render** | Deploy del backend |
| **Vercel** | Deploy del frontend |
| **Git + GitHub** | Control de versiones |

---

## 📁 Arquitectura / Estructura del Proyecto

```
IceCore/
├── backend/                          # API REST (Spring Boot)
│   ├── src/main/java/.../icecore/
│   │   ├── entity/                   # 📦 Entidades JPA (tablas)
│   │   │   ├── Pedido.java
│   │   │   ├── ItemPedido.java
│   │   │   ├── Gusto.java
│   │   │   ├── TipoProducto.java
│   │   │   ├── Usuario.java
│   │   │   ├── Repartidor.java
│   │   │   ├── DeliveryRound.java
│   │   │   ├── Invoice.java
│   │   │   ├── BillingSettings.java
│   │   │   └── Horarios.java
│   │   ├── repository/               # 📂 Acceso a datos (JpaRepository)
│   │   ├── service/                  # ⚙️ Lógica de negocio
│   │   │   ├── PedidoService.java
│   │   │   ├── GustoService.java
│   │   │   ├── DeliveryService.java
│   │   │   └── BillingService.java
│   │   ├── controller/               # 🌐 Endpoints REST
│   │   │   ├── PedidoController.java
│   │   │   ├── GustoController.java
│   │   │   ├── PaymentController.java
│   │   │   ├── DeliveryController.java
│   │   │   └── BillingController.java
│   │   ├── dto/                      # 📋 Data Transfer Objects
│   │   └── config/                   # 🔒 Seguridad + inicialización
│   ├── src/main/resources/
│   │   └── application.properties    # Config DB, JPA, MercadoPago
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # SPA (React + Vite)
│   ├── src/
│   │   ├── pages/                    # 📄 Páginas
│   │   │   ├── Home.jsx              #    Landing page
│   │   │   ├── Catalog.jsx           #    Catálogo de sabores
│   │   │   ├── Order.jsx             #    Flujo de pedido (3 pasos)
│   │   │   ├── CartPage.jsx          #    Carrito
│   │   │   ├── Checkout.jsx          #    Checkout + pago
│   │   │   └── admin/                #    Panel administrador
│   │   ├── components/               # 🧩 Componentes reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ErrorModal.jsx
│   │   ├── context/                  # 🌍 Estado global
│   │   │   ├── CartContext.jsx       #    Carrito + catálogo
│   │   │   ├── AuthContext.jsx       #    Autenticación admin
│   │   │   └── UIContext.jsx         #    Modal de errores
│   │   ├── hooks/                    # 🪝 Custom hooks
│   │   ├── lib/                      # 📡 Axios + utils
│   │   └── data/                     # 📦 Catálogo estático (fallback)
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── Dockerfile                        # Build unificado
└── README.md
```

### Patrón de Capas (Backend)

```
Request HTTP → Controller → Service → Repository → Entity → PostgreSQL
```

| Capa | Responsabilidad |
|------|----------------|
| **Controller** | Recibir requests HTTP y devolver responses JSON |
| **Service** | Lógica de negocio, validaciones, cálculos |
| **Repository** | Queries a la base de datos (generados por Spring) |
| **Entity** | Mapeo Java ↔ Tabla SQL |
| **DTO** | Estructura de datos que viaja entre frontend y backend |
| **Config** | Seguridad (Spring Security) e inicialización de datos |

---

## 🚀 Instrucciones de Instalación

### Prerequisitos

- **Java 21** (JDK)
- **Maven** 3.9+
- **Node.js** 18+ y **npm**
- **PostgreSQL** 14+
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/Thiagom05/IceCore.git
cd IceCore
```

### 2. Configurar la Base de Datos

Crear una base de datos PostgreSQL:

```sql
CREATE DATABASE icecore_db;
```

> Las tablas se crean automáticamente al iniciar el backend (Hibernate `ddl-auto=update`).

### 3. Backend (Spring Boot)

```bash
cd backend

# Configurar credenciales (editar application.properties o usar variables de entorno):
# SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/icecore_db
# SPRING_DATASOURCE_USERNAME=postgres
# SPRING_DATASOURCE_PASSWORD=tu_password

# Compilar y ejecutar
./mvnw spring-boot:run
```

El backend estará disponible en `http://localhost:8080`.

> Al iniciar por primera vez se crea automáticamente un usuario admin: `admin` / `admin123`.

### 4. Frontend (React + Vite)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores:
#   VITE_API_URL=http://localhost:8080/api
#   VITE_WHATSAPP_NUMBER=tu_numero
#   VITE_ENABLE_PAYMENTS=false

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

### 5. Acceso

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173` | Tienda pública (cliente) |
| `http://localhost:5173/admin` | Panel administrativo |
| `http://localhost:8080/api/*` | API REST |

---

## 📝 Variables de Entorno

### Backend (`application.properties` o variables de entorno)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | URL de conexión PostgreSQL | `jdbc:postgresql://localhost:5432/icecore_db` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de la DB | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de la DB | — |
| `PORT` | Puerto del servidor | `8080` |
| `mercadopago.access_token` | Token de MercadoPago | — |

### Frontend (`.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend | `http://localhost:8080/api` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp del negocio | — |
| `VITE_ENABLE_PAYMENTS` | Habilitar pagos reales | `false` |
| `VITE_DEMO_MODE` | Modo demo/portfolio | — |

---

## 🐳 Docker

### Ejecutar backend con Docker

```bash
cd backend
docker build -t icecore-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/icecore_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=tu_password \
  icecore-backend
```

---

## 👤 Autor

**Thiago Masson** — Estudiante de la Tecnicatura Universitaria en Programación (UTN)

---
