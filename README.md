# MELO Pets — Sistema Web de Gestión Integral

Sistema web para centralizar y gestionar la información de MELO Pets: clientes, mascotas, productos, inventario, servicios y ventas. Incluye caja digital con cálculo automático de ITBMS (7%), control transaccional de inventario, historial de compras/servicios por mascota, y reportes gerenciales mediante vistas de PostgreSQL.

## Tecnologías

**Backend:** Node.js + Express + TypeScript, PostgreSQL (`pg`), autenticación con JWT + bcrypt, validación con Zod, `helmet`.

**Frontend:** React 19 + TypeScript + Vite, React Router.

## Estructura del repositorio

```
melo-pets/
├── backend/            # API REST (Express + TypeScript)
├── frontend/            # Aplicación web (React + Vite)
├── database/
│   └── melo_pets.sql    # Respaldo completo (esquema + datos) de PostgreSQL
└── README.md
```

## Requisitos previos

Antes de empezar, instala en tu máquina:

- **Node.js** 20 LTS o superior (incluye npm)
- **PostgreSQL** (16 o superior) con **pgAdmin**
- **Git**

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd melo-pets
```

## 2. Configurar la base de datos (PostgreSQL vía pgAdmin)

No se necesita usar la terminal para esta parte, todo se hace desde pgAdmin.

1. Abre pgAdmin y conéctate a tu servidor local de PostgreSQL.
2. Crea el rol de acceso: click derecho en **Login/Group Roles → Create → Login/Group Role**.
   - **General → Name:** `melo_admin`
   - **Definition → Password:** la que tú quieras (usa esa misma contraseña en tu `.env` más adelante)
   - **Privileges:** activa **Can login?**
   - Guarda.
3. Crea la base de datos: click derecho en **Databases → Create → Database**.
   - **Database:** `melo_pets`
   - **Owner:** `melo_admin`
   - Guarda.
4. Carga el esquema y los datos: click derecho sobre la base `melo_pets` (ya conectado a ella) → **Query Tool**.
5. En el Query Tool, ve a **File → Open** y selecciona el archivo `database/melo_pets.sql` de este repositorio.
6. Ejecuta todo el script con el botón ▶️ (o la tecla **F5**).
7. Verifica que se haya creado todo: en el árbol de la izquierda, expande `melo_pets → Schemas → public → Tables` — deberías ver 15 tablas (`clientes`, `mascotas`, `productos`, `usuarios`, etc.), y en `Views` deberías ver las vistas de reportes (`vw_productos_mas_vendidos`, `vw_servicios_mas_solicitados`, etc.).

**Si el script falla al ejecutarse:** las primeras y últimas líneas del archivo (`\restrict ...` y `\unrestrict ...`) son propias de versiones recientes de `psql`/PostgreSQL. Si tu versión no las reconoce, simplemente borra esas dos líneas del archivo y vuelve a ejecutar.

## 3. Configurar y levantar el backend

```bash
cd backend
npm install
```

Crea un archivo `.env` dentro de `backend/` con este contenido, ajustando `PGPASSWORD` a la contraseña que usaste en el paso 2:

```dotenv
# --- Servidor ---
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# --- Base de datos (debe coincidir con lo que creaste en pgAdmin) ---
PGHOST=localhost
PGPORT=5432
PGDATABASE=melo_pets
PGUSER=melo_admin
PGPASSWORD=tu_contraseña_aqui

# --- Autenticación ---
# Generar uno propio, por ejemplo con: openssl rand -hex 32
JWT_SECRET=cambiar_este_secreto_por_uno_largo_y_aleatorio
JWT_EXPIRES_IN=8h
```

Levanta el servidor en modo desarrollo:

```bash
npm run dev
```

El backend debería quedar escuchando en `http://localhost:4000`.

## 4. Configurar y levantar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## 5. Credenciales de prueba

| Rol      | Usuario            | Contraseña           |
|----------|---------------------|------------------------|
| GERENTE  | `melissa.gerente`   | `MeloGerente#2026`     |
| CAJERO   | `diego.cajero`      | `MeloCajero#2026`      |

## Scripts disponibles

**Backend** (`backend/package.json`): `npm run dev` (desarrollo con recarga automática), `npm run build` (compila a `dist/`), `npm start` (ejecuta la versión compilada), `npm run typecheck`.

**Frontend** (`frontend/package.json`): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
