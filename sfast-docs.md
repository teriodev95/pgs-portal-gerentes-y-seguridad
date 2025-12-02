# API Endpoints - PGS App

Documentación de todos los endpoints utilizados en la aplicación PGS.

## API V1

**Base URL:** `https://sfast.xpress1.cc/xpress/v1`

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pwa/login` | Autenticación de usuario |

### Cierres Semanales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/cierres_semanales/asignaciones_y_gastos/by_usuario-id_gerencia_anio_and_semana/{userId}/{management}/{year}/{week}` | Obtiene asignaciones y gastos por usuario, gerencia, año y semana |

### Call Center

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/call_center/reportes/usuario/` | Obtiene reportes de usuario del call center |
| POST | `/call_center/visitas/create-one` | Crea una nueva visita |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/dashboard-fecha/{agency}/{date}` | Obtiene datos del dashboard por agencia y fecha |
| GET | `/dashboard-gerencia/{management}/{year}/{week}` | Obtiene dashboard por gerencia, año y semana |

### Préstamos (Loans)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/loans/por_finalizar_by_agencia/{agency}/{year}/{week}` | Obtiene préstamos por finalizar por agencia |
| GET | `/loans/{id}` | Obtiene detalles de un préstamo específico |

### Gastos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/gastos/by_usuario_id/{userId}` | Obtiene gastos por usuario |
| POST | `/pwa/gastos/create` | Crea un nuevo gasto |

### Incidentes y Reposiciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/incidentes-reposiciones/usuarioId/{userID}/anio/{year}/semana/{week}` | Obtiene incidentes y reposiciones por usuario, año y semana |
| POST | `/pwa/incidentes-reposiciones/create-one` | Crea un nuevo incidente o reposición |

### Pagos (Pays)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pays/create-one` | Crea un nuevo pago |
| GET | `/pays/noPagosWithVisitas/{user}/{year}/{week}` | Obtiene pagos pendientes con visitas |
| GET | `/pays/{agency}/{year}/{week}` | Obtiene pagos por agencia, año y semana |

### Histórico

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/historico/{id}` | Obtiene el histórico de un registro específico |

### Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ventas/create` | Crea una nueva venta |
| GET | `/ventas/by_gerencia_anio_and_semana/{management}/{year}/{week}` | Obtiene ventas por gerencia, año y semana |

### Liquidaciones (Payoffs)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/payoffs/data/{id}` | Obtiene datos de liquidación |
| POST | `/pwa/payoffs/create-one` | Crea una nueva liquidación |

### Tabulaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pwa/tabulaciones/create` | Crea una nueva tabulación |
| PUT | `/pwa/tabulaciones/update/gerencia/{management}/anio/{year}/semana/{week}` | Actualiza tabulación por gerencia, año y semana |
| GET | `/pwa/tabulaciones/gerencia/{management}/anio/{year}/semana/{week}` | Obtiene tabulaciones por gerencia, año y semana |

### Catálogos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/agencias?gerencia={gerencia}` | Obtiene agencias por gerencia |
| GET | `/pwa/gerencias?usuario={user}` | Obtiene gerencias por usuario |

### Cobranza

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pwa/cobranza/{agency}/{year}/{week}` | Obtiene datos de cobranza por agencia, año y semana |

---

## API V2

**Base URL:** `https://sfast.xpress1.cc/api/v2`

### Detalles de Cierres

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/detalles-cierres-agencias/gerencia/{management}` | Obtiene detalles de cierres de agencias por gerencia |

### Números de Gerencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/numeros-gerencias/gerencia/{management}` | Obtiene números de gerencias |

---

## Notas

- Los parámetros entre llaves `{}` deben ser reemplazados por los valores correspondientes
- V1 es la versión principal con la mayoría de los endpoints
- V2 contiene endpoints más recientes para reportes y análisis de gerencias
- Todos los endpoints requieren autenticación previa mediante `/pwa/login`