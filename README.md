# Finanzas Claras — finanzas personales

Finanzas Claras es una aplicación web de registro y organización personal. Permite explorar una demostración con datos ficticios sin iniciar sesión y, al crear una cuenta, anotar ingresos y gastos, definir límites mensuales y seguir metas de ahorro. No se conecta a bancos ni mueve dinero.

## Tecnologías

- **Frontend:** React + TypeScript + Vite. Los estilos están organizados en CSS global y hojas CSS junto a cada componente o pantalla.
- **Backend / API:** NestJS con endpoints REST bajo `/api`.
- **Persistencia local:** archivo JSON en `backend/data/luma.json`. La contraseña se guarda como hash con bcryptjs.

## Requisitos

- Node.js 20 o posterior y npm.

## Puesta en marcha

Desde la carpeta raíz del proyecto:

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` y la API en `http://localhost:3001/api`. Vite reenvía las solicitudes `/api` al backend. Podés explorar el panel de muestra sin registrarte; para guardar tus propios movimientos, presupuestos o metas, creá una cuenta o iniciá sesión.

También podés iniciar cada parte por separado:

```bash
npm run dev:api
npm run dev:web
```

En PowerShell, configurá un secreto propio antes de iniciar el backend:

```powershell
$env:JWT_SECRET = "reemplaza-esto-por-un-secreto-largo"
npm run dev
```

El backend usa un secreto de desarrollo si `JWT_SECRET` no está definido. Para publicar la aplicación, configurá uno seguro y usá una base de datos y un almacenamiento adecuados para producción.

## Funciones

- Registro con nombre, correo electrónico y contraseña; inicio y cierre de sesión.
- Opción para mostrar u ocultar la contraseña en el formulario de acceso.
- Exploración como visitante con movimientos, presupuestos y metas de ejemplo; los cambios personales requieren una cuenta.
- Resumen de saldo registrado, ingresos y gastos del mes, evolución de seis meses y movimientos recientes.
- Alta, edición, eliminación, búsqueda y filtros de movimientos.
- Presupuestos mensuales por categoría, con seguimiento de gastos anotados en el mes actual.
- Metas con monto objetivo, avance inicial opcional, fecha objetivo y aportes manuales.
- Centro de ayuda con guía de inicio y preguntas frecuentes.
- Tema claro/oscuro persistido en el navegador y diseño adaptable a pantallas chicas.

## Organización

```text
frontend/
  src/
    App.css       # Estilos globales y tokens visuales
    components/   # Navegación, diálogos e íconos de categoría
      *.css       # Estilos locales de cada componente
    pages/        # Inicio, movimientos, presupuestos, metas y ayuda
      *.css       # Estilos locales de cada pantalla
    services/     # Cliente API y formato de moneda/fechas
backend/
  src/
    auth/         # Registro, login y sesión
    budgets/      # Endpoints y lógica de presupuestos
    common/       # Guardia JWT y usuario actual
    database/     # Persistencia JSON y tipos de datos
    goals/        # Metas y aportes
    transactions/ # Movimientos
```

## API principal

Las rutas privadas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Obtener la cuenta activa |
| `GET`, `POST` | `/api/transactions` | Listar y anotar movimientos |
| `PUT`, `DELETE` | `/api/transactions/:id` | Editar o eliminar un movimiento |
| `GET`, `POST` | `/api/budgets` | Listar o crear/ajustar presupuestos |
| `DELETE` | `/api/budgets/:id` | Eliminar un presupuesto |
| `GET`, `POST` | `/api/goals` | Listar o crear metas |
| `POST` | `/api/goals/:id/contributions` | Actualizar el avance de una meta |
| `DELETE` | `/api/goals/:id` | Eliminar una meta |
| `GET` | `/api/health` | Comprobar que la API responde |

## Datos y alcance

El archivo JSON sirve para uso local y prototipos: no ofrece copias de seguridad, concurrencia ni controles operativos propios de una aplicación publicada. Para desplegar Finanzas Claras para varias personas, reemplazá el almacenamiento local por una base de datos y configurá HTTPS, secretos de entorno y una política de respaldo. El token de sesión se mantiene en `localStorage` del navegador.
