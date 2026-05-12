# El Templo Fitness — Sistema Web

Sistema de gestión para gimnasio desarrollado como proyecto académico.

**Curso:** Administración de Sistemas de Información  
**Semestre:** 8° | **Docente:** Janer E. Pava  
**Integrantes:** Juan Manuel Armella, Darlinson Barreto, Miguel Angel Caicedo, Angelina Figueroa  

---

## Tecnologías

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Autenticación:** JWT + bcrypt

---

## Requisitos previos

Tener instalado en el equipo:

- [Node.js](https://nodejs.org) (versión LTS)
- [XAMPP](https://www.apachefriends.org) o MySQL
- [Git](https://git-scm.com)

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/VanHelsing385/el-templo-fitness.git
cd el-templo-fitness
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend` con el siguiente contenido:

```
DB_USER=root
DB_PASS=tu_contraseña_mysql
JWT_SECRET=una_clave_secreta_larga
```

### 4. Importar la base de datos

- Abrir **phpMyAdmin** desde XAMPP
- Ir a la pestaña **SQL**
- Ejecutar el archivo `script.sql` que está en la raíz del proyecto

### 5. Iniciar MySQL

- Abrir XAMPP y hacer click en **Start** al lado de MySQL

### 6. Correr el servidor

```bash
cd backend
node server.js
```

El servidor quedará corriendo en `http://localhost:3000`

---

## Endpoints de la API

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Iniciar sesión | No |

**Body login:**
```json
{
    "correo": "correo@ejemplo.com",
    "contrasena": "contraseña"
}
```

**Respuesta:**
```json
{
    "token": "eyJhbGci...",
    "rol": "cliente"
}
```

---

### Rutas del cliente

> Requieren token JWT con rol `cliente`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cliente/perfil` | Datos personales del cliente |
| GET | `/cliente/membresia` | Estado y fechas de la membresía |
| GET | `/cliente/pagos` | Historial de pagos |

---

### Rutas del recepcionista

> Requieren token JWT con rol `recepcionista`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/recepcionista/clientes` | Registrar nuevo cliente |
| GET | `/recepcionista/clientes` | Listar todos los clientes |
| GET | `/recepcionista/clientes?buscar=nombre` | Buscar cliente por nombre o CC |
| GET | `/recepcionista/clientes/:id` | Ver cliente con membresía y pagos |
| PUT | `/recepcionista/clientes/:id` | Actualizar datos del cliente |
| POST | `/recepcionista/pagos` | Registrar pago y actualizar membresía |

---

## Cómo usar el token en las peticiones

Después del login, incluir el token en el header de cada petición:

```
Authorization: Bearer <token>
```

---

## Roles del sistema

| Rol | ID | Acceso |
|-----|----|--------|
| cliente | 1 | Ver perfil, membresía e historial de pagos |
| recepcionista | 2 | Gestionar clientes y registrar pagos |
| administrador | 3 | Por definir en versión futura |

---

## Estructura del proyecto

```
el-templo-fitness/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clienteController.js
│   │   └── recepController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cliente.js
│   │   └── recepcionista.js
│   ├── DB.js
│   ├── server.js
│   └── package.json
├── frontend/
└── script.sql
```

---

## Limitaciones del sistema

- Sin pagos en línea — todos los pagos se registran manualmente en recepción
- Sin app móvil — solo web
- Sin gestión de clases ni horarios
- Sin notificaciones automáticas de vencimiento
- Módulo administrador pendiente para versión futura
- Huella biométrica preparada en BD, pendiente de integración con hardware