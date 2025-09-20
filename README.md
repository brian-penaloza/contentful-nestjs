# Contentful NestJS API

Una API REST desarrollada con NestJS que se conecta a un endpoint externo, almacena datos en PostgreSQL y proporciona endpoints públicos y privados.

## Características

- **Integración con Contentful**: Obtiene datos de Contentful CMS cada hora
- **Base de datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT para endpoints privados
- **APIs públicas**: Consulta de productos con filtros, datos externos
- **APIs privadas**: Reportes y productos con stock bajo
- **Dockerizado**: Configuración completa con Docker Compose
- **Seed automático**: Se ejecuta automáticamente al iniciar la aplicación

## Endpoints Públicos

### Productos

- `GET /products` - Obtener productos con filtros (nombre, categoría, rango de precio)

### API Externa

- `GET /external/products` - Obtener datos directamente del endpoint externo

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse

## Endpoints Privados (requieren JWT)

### Eliminacion

- `DELETE /products/:id` - Eliminar producto (soft delete) - Requiere autenticación

### Reportes

- `GET /products/deleted-percentage` - Porcentaje de productos eliminados
- `GET /products/report` - Porcentaje de productos no eliminados con filtros
  - `hasPrice` (boolean): Filtrar por productos con/sin precio
  - `startDate` (string): Fecha de inicio (formato: YYYY-MM-DD)
  - `endDate` (string): Fecha de fin (formato: YYYY-MM-DD)
- `GET /products/low-stock?stock=NUMBER` - Productos con stock menor al número especificado

## Instalación y Uso

### Prerequisitos

#### Imágenes de Docker requeridas:

Para levantar el proyecto con Docker Compose, necesitas las siguientes imágenes:

- **PostgreSQL**: `postgres:15-alpine` (~200MB)
- **Node.js**: `node:22-alpine` (~150MB)

**No necesitas instalar nada manualmente**. Docker Compose descarga automáticamente las imágenes cuando ejecutes `docker-compose up -d`.

#### Verificar instalación:

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version
```

#### Espacio total requerido:
- **Total aproximado**: ~650MB (incluyendo dependencias)


### Con Docker (Recomendado)

#### Producción

```bash
# Clona el repositorio
git clone <https://github.com/brian-penaloza/contentful-nestjs>
cd contentful-nestjs

# Ejecuta en modo producción
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

#### Desarrollo

```bash
# Ejecuta en modo desarrollo (con hot reload)
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

### Desarrollo Local (sin Docker)

1. Instala dependencias:

```bash
npm install
```

2. Configura PostgreSQL localmente

3. Crea un archivo `.env` con las variables de entorno:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=contentful_db

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development

# Contentful API
CONTENTFUL_BASE_URL=https://cdn.contentful.com
CONTENTFUL_SPACE_ID=space_id
CONTENTFUL_ACCESS_TOKEN=access_token
CONTENTFUL_ENVIRONMENT=env
CONTENTFUL_CONTENT_TYPE=content_type
```

4. Ejecuta:

```bash
npm run start:dev
```

## Variables de Entorno

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=contentful_db

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development

# Contentful API
CONTENTFUL_BASE_URL=https://cdn.contentful.com
CONTENTFUL_SPACE_ID=space_id
CONTENTFUL_ACCESS_TOKEN=access_token
CONTENTFUL_ENVIRONMENT=env
CONTENTFUL_CONTENT_TYPE=content_type
```

## Uso de la API

### Autenticación

1. Registra un usuario:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

2. Inicia sesión:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Obtener todos los productos

### Consulta Externa de Productos

```bash
curl http://localhost:3000/external/products
```

### Consultar Productos

```bash
# Obtener todos los productos
curl http://localhost:3000/products

# Filtrar por nombre
curl "http://localhost:3000/products?name=laptop"

# Filtrar por categoría
curl "http://localhost:3000/products?category=electronics"

# Filtrar por rango de precio
curl "http://localhost:3000/products?minPrice=100&maxPrice=500"

# Paginación
curl "http://localhost:3000/products?page=1&limit=5"
```

### Endpoints Privados

```bash
# Eliminar producto
curl -X DELETE -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/products/1

# Obtener estadísticas
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/products/deleted-percentage

# Reporte de productos no eliminados
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/products/report

# Reporte con filtros de fecha y precio
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/products/report?hasPrice=true&startDate=2025-01-01&endDate=2025-12-31"

# Productos con stock bajo (especificar stock)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/products/low-stock?stock=10"
```

## Estructura del Proyecto

```text
src/
├── auth/                 # Módulo de autenticación
├── product/             # Módulo de productos
├── external-api/        # Módulo de API externa
├── app.module.ts        # Módulo principal
└── main.ts             # Punto de entrada
```

## Tecnologías Utilizadas

- NestJS
- TypeORM
- PostgreSQL
- JWT
- Docker
- Axios
- Class Validator
- Passport
