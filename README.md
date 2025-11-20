# 📚 Backend – NestJS API (CMPC Technical Test)

Este backend implementa una API RESTful completa utilizando **NestJS**, **TypeORM**, **JWT**, **PostgreSQL** y **Jest** para pruebas unitarias con alta cobertura.

---

## 🚀 Tecnologías Principales

- **NestJS** – Arquitectura modular, escalable y mantenible.
- **TypeORM** – ORM para modelar entidades y realizar consultas.
- **PostgreSQL** – Base de datos relacional.
- **JWT + Passport** – Autenticación.
- **Jest** – Pruebas unitarias y cobertura.
- **Class Validator / Class Transformer** – Validaciones automáticas con DTOs.

---

## 📁 Estructura del Proyecto

```
src/
 ├── Auth/
 │   ├── dto/
 │   ├── auth.controller.ts
 │   ├── auth.service.ts
 │   ├── jwt.auth.guard.ts
 │   ├── jwt.strategy.ts
 ├── user/
 ├── book/
 ├── author/
 ├── genre/
 ├── publisher/
 ├── common/
 │   ├── filters/
 │   ├── interceptors/
 ├── app.module.ts
 ├── main.ts
```

Cada módulo contiene:

✔ Controller  
✔ Service  
✔ Entity  
✔ DTOs  
✔ Tests (controller + service)

---

## 🛢️ Configuración de Base de Datos

Archivo: **`app.module.ts`**

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: true,
});
```

Puedes correr PostgreSQL local o vía Docker.

---

## 🐳 Docker

```
docker run --name cmpc-db -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres
```

Variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=admin
DB_NAME=cmpc
JWT_SECRET=supersecret
```

---

## ▶️ Scripts

| Comando             | Descripción                  |
| ------------------- | ---------------------------- |
| `npm run start`     | Ejecuta la API               |
| `npm run start:dev` | Modo desarrollo              |
| `npm run build`     | Compila a producción         |
| `npm run test`      | Ejecuta todos los tests      |
| `npm run test:cov`  | Muestra reporte de cobertura |

---

## 🧪 Pruebas Unitarias

Se realizaron **tests para cada módulo**:

- Auth (service + controller)
- Users (service + controller)
- Books (service + controller)
- Authors (service + controller)
- Genres (service + controller)
- Publishers (service + controller)
- Filtros e interceptores (logging, transform, exceptions)

Ejecutar cobertura:

```
npm run test:cov
```

---

## 🔐 Autenticación JWT

Endpoints:

| Método                                       | Ruta             | Descripción       |
| -------------------------------------------- | ---------------- | ----------------- |
| POST                                         | `/auth/register` | Crea usuario      |
| POST                                         | `/auth/login`    | Devuelve token    |
| GET                                          | `/users`         | Protegido con JWT |
| CRUD de libros, autores, géneros, publishers |

Ejemplo login:

```
POST /auth/login
{
  "email": "test@mail.com",
  "password": "123456"
}
```

Respuesta:

```
{
  "id": 1,
  "name": "User",
  "email": "test@mail.com",
  "access_token": "xxxx"
}
```

---

## 📚 Endpoints Principales

Cada entidad tiene CRUD:

- `/books`
- `/authors`
- `/genres`
- `/publishers`
- `/users`

Operaciones:

✔ GET all  
✔ GET by ID  
✔ POST  
✔ PUT  
✔ DELETE

Algunas rutas requieren JWT:

```ts
@UseGuards(JwtAuthGuard)
```

---

## 🧱 Patrones de Diseño Utilizados

- **Repository Pattern** (TypeORM)
- **Dependency Injection** (NestJS Providers)
- **DTO Pattern** (Validación + tipado)
- **Interceptor Pattern** (Transform + Logging)
- **Exception Filter** centralizado
- **Modular Architecture** escalable por feature

---

## 📄 Documentación API

Puedes habilitar Swagger en `main.ts`:

```ts
const config = new DocumentBuilder()
  .setTitle('CMPC API')
  .setDescription('API para prueba técnica')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

Luego:

```
http://localhost:3000/api
```

---

## 🚀 Cómo Ejecutar Todo

### 1. Instalar dependencias

```
npm install
```

### 2. Configurar variables de entorno

Crear un `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=admin
DB_NAME=cmpc
JWT_SECRET=supersecret
```

### 3. Levantar PostgreSQL (local o Docker)

### 4. Ejecutar API

```
npm run start:dev
```

---

## ✔ Estado del Proyecto

| Área                        | Estado                 |
| --------------------------- | ---------------------- |
| Backend funcional           | ✅ Completo            |
| Base de datos               | ✅ Entidades generadas |
| Seguridad JWT               | ✅                     |
| Tests unitarios             | ✅ Alta cobertura      |
| Servicios CRUD              | ✅                     |
| Arquitectura limpia modular | ✅                     |
| Interceptores / Filtros     | ✅ Testeados           |
| Documentación               | ✅ Entregable          |

---
