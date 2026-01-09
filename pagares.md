# Documentación de Endpoints de Pagarés

## URLs Base

| Entorno | URL |
|---------|-----|
| **Producción** | `https://elysia.xpress1.cc` |
| Desarrollo | `http://localhost:3069` |

---

## Flujo de Usuario

```
1. Usuario escribe nombre de persona (debounce 300-500ms)
2. Frontend llama POST /api/pagares/buscar-personas
3. Se muestran los préstamos completados de la persona
4. Por cada préstamo se indica si YA tiene pagaré o NO
5. Usuario selecciona préstamo SIN pagaré
6. Frontend llama POST /api/pagares/crear
7. Se muestra confirmación con id_sistemas del pagaré creado
```

---

## 1. Buscar Personas con Préstamos

**Endpoint:** `POST /api/pagares/buscar-personas`

**Uso:** Autocomplete mientras usuario teclea (usar debounce 300-500ms)

### Request
```json
{
  "termino": "JUAN",
  "gerencia": "GERC001"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| termino | string | Sí | Mínimo 2 caracteres. Busca en nombres y apellidos |
| gerencia | string | Sí | ID de gerencia del usuario logueado |

### Response Exitoso
```json
{
  "success": true,
  "code": "OK",
  "message": "5 resultado(s) encontrado(s)",
  "request_id": "req_abc123",
  "duration_ms": 45,
  "meta": {
    "timezone": "America/Mexico_City",
    "as_of": "2026-01-09T10:30:00.000Z",
    "query": { "termino": "JUAN", "gerencia": "GERC001" }
  },
  "data": [
    {
      "persona_id": "M0AL-2613-M73Q-de",
      "nombre_completo": "JUAN PEREZ LOPEZ",
      "telefono": "5512345678",
      "prestamo_id": "12345-ca",
      "sucursal": "capital",
      "agencia": "AGC001",
      "monto_prestamo": 5000,
      "total_a_pagar": 6500,
      "tiene_pagare": 0,
      "id_sistemas": null
    },
    {
      "persona_id": "M0AL-2613-M73Q-de",
      "nombre_completo": "JUAN PEREZ LOPEZ",
      "telefono": "5512345678",
      "prestamo_id": "12340-ca",
      "sucursal": "capital",
      "agencia": "AGC001",
      "monto_prestamo": 3000,
      "total_a_pagar": 3900,
      "tiene_pagare": 1,
      "id_sistemas": "02-26-0001-ca"
    }
  ]
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| persona_id | string | ID de la persona (formato alfanumérico) |
| nombre_completo | string | Nombre completo |
| telefono | string | Teléfono |
| prestamo_id | string | ID del préstamo completado |
| sucursal | string | Sucursal del préstamo |
| agencia | string | Agencia del préstamo |
| monto_prestamo | number | Monto otorgado |
| total_a_pagar | number | Total a pagar |
| **tiene_pagare** | number | **0 = NO tiene pagaré, 1 = YA tiene pagaré** |
| **id_sistemas** | string/null | **ID del pagaré si existe, null si no** |

### Lógica en Frontend

```typescript
// Si tiene_pagare === 0 → Mostrar botón "Crear Pagaré"
// Si tiene_pagare === 1 → Mostrar "Ya tiene pagaré: {id_sistemas}"

{data.map(item => (
  <div key={item.prestamo_id}>
    <p>{item.nombre_completo} - {item.prestamo_id}</p>
    <p>Monto: ${item.monto_prestamo}</p>

    {item.tiene_pagare === 0 ? (
      <button onClick={() => crearPagare(item.prestamo_id)}>
        Crear Pagaré
      </button>
    ) : (
      <span className="badge">Pagaré: {item.id_sistemas}</span>
    )}
  </div>
))}
```

---

## 2. Crear Pagaré

**Endpoint:** `POST /api/pagares/crear`

**Autenticación:** Requiere Bearer token

### Request
```json
{
  "prestamo_id": "12345-ca",
  "usuario": "admin"
}
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Response Exitoso
```json
{
  "success": true,
  "code": "OK",
  "message": "Pagaré creado correctamente",
  "request_id": "req_def456",
  "duration_ms": 120,
  "meta": {
    "timezone": "America/Mexico_City",
    "as_of": "2026-01-09T10:31:00.000Z"
  },
  "data": {
    "id_sistemas": "02-26-0015-ca",
    "prestamo_id": "12345-ca"
  }
}
```

### Errores Posibles

| Code | Descripción |
|------|-------------|
| PRESTAMO_NO_ENCONTRADO | El préstamo no existe en prestamos_completados |
| PAGARE_YA_EXISTE | El préstamo ya tiene un pagaré asociado |
| UNAUTHORIZED | Token inválido o faltante |

---

## 3. Búsqueda de Pagarés con Filtros

**Endpoint:** `POST /api/pagares/search`

**Uso:** Listado y filtrado de pagarés existentes

### Request Básico
```json
{
  "filter": {
    "type": "rule",
    "field": "gerencia",
    "operator": "=",
    "value": "GERC001"
  },
  "page": 1,
  "limit": 20,
  "sortBy": "created_at",
  "order": "desc"
}
```

### Request con Filtros Combinados
```json
{
  "filter": {
    "type": "group",
    "logic": "AND",
    "children": [
      {
        "type": "rule",
        "field": "gerencia",
        "operator": "=",
        "value": "GERC001"
      },
      {
        "type": "rule",
        "field": "semaforo",
        "operator": "isNull",
        "value": null
      }
    ]
  },
  "page": 1,
  "limit": 50
}
```

### Campos Filtrables

| Campo | Tipo | Operadores Sugeridos |
|-------|------|---------------------|
| id_sistemas | string | =, includes, startsWith |
| folio | string | =, includes |
| prestamo_id | string | =, includes |
| gerencia | string | =, in |
| sucursal | string | =, in |
| agencia | string | =, in |
| tipo_credito | string | =, in |
| dia_de_pago | string | =, in |
| semana_inicio | number | =, >, <, between |
| anio_inicio | number | =, >, <, between |
| cliente_nombre | string | includes, startsWith |
| cliente_telefono | string | =, includes |
| aval_nombre | string | includes, startsWith |
| aval_telefono | string | =, includes |
| semaforo | enum | =, isNull, isNotNull |
| marca_folio | enum | =, isNull, isNotNull |

### Operadores Disponibles

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| = | Igual | `{ "operator": "=", "value": "GERC001" }` |
| != | Diferente | `{ "operator": "!=", "value": "PERDIDO" }` |
| includes | Contiene (case insensitive) | `{ "operator": "includes", "value": "JUAN" }` |
| startsWith | Empieza con | `{ "operator": "startsWith", "value": "02-26" }` |
| >, >=, <, <= | Comparación numérica | `{ "operator": ">=", "value": 2025 }` |
| between | Rango | `{ "operator": "between", "value": [1, 10] }` |
| in | Lista de valores | `{ "operator": "in", "value": ["GERC001", "GERC002"] }` |
| isNull | Es nulo | `{ "operator": "isNull" }` |
| isNotNull | No es nulo | `{ "operator": "isNotNull" }` |

### Response
```json
{
  "success": true,
  "code": "OK",
  "message": "20 pagaré(s) encontrado(s)",
  "request_id": "req_ghi789",
  "duration_ms": 85,
  "meta": {
    "timezone": "America/Mexico_City",
    "as_of": "2026-01-09T10:32:00.000Z",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false
    }
  },
  "data": [
    {
      "id_sistemas": "02-26-0001-ca",
      "folio": "F-12345",
      "prestamo_id": "12345-ca",
      "gerencia": "GERC001",
      "fecha_entrega_pagare": "09/01/26",
      "hora_entrega_pagare": "10:30",
      "sucursal": "capital",
      "agencia": "AGC001",
      "nombre_agente": "MARIA GONZALEZ",
      "monto_prestamo": 5000,
      "cargo": 1500,
      "total_a_pagar": 6500,
      "pago_semanal": 500,
      "plazo": "13 SEM",
      "cliente_nombre": "JUAN PEREZ LOPEZ",
      "cliente_domicilio": "AV REFORMA 123, CENTRO, C.P. 06000",
      "cliente_telefono": "5512345678",
      "aval_nombre": "PEDRO MARTINEZ",
      "entregado": 0,
      "semaforo": null,
      "marca_folio": null,
      "created_at": "2026-01-09T10:30:00.000Z"
    }
  ]
}
```

---

## 4. Obtener Pagaré por ID

**Endpoint:** `GET /api/pagares/:id`

### Response
```json
{
  "success": true,
  "code": "OK",
  "message": "Pagaré encontrado",
  "data": {
    // Misma estructura que en /search
  }
}
```

---

## 5. Actualizar Pagaré

**Endpoint:** `PATCH /api/pagares/:id`

**Autenticación:** Requiere Bearer token

### Campos Editables

| Campo | Tipo | Descripción |
|-------|------|-------------|
| lugar_entrega | string | Lugar donde se entregó |
| observaciones | string | Notas adicionales |
| entregado | boolean/number | Si fue entregado (0/1) |
| fecha_entrega_pagare | string | Fecha de entrega (YYYY-MM-DD) |
| nombre_quien_recibio | string | Nombre de quien recibió |
| parentesco_quien_recibio | string | Parentesco |
| semaforo | enum | Estado del pagaré |
| marca_folio | enum | Marca especial |
| entregado_cliente_at | string | Timestamp entrega a cliente |
| entregado_cliente_by | string | Usuario que entregó |
| recibido_oficina_at | string | Timestamp recepción oficina |
| recibido_oficina_by | string | Usuario que recibió |

### Valores de Semáforo
```
ENTREGADO, RETORNADO_NO_ENCONTRADO, LIQ_ESPECIAL,
PERDIDO, ARCHIVO, JURIDICO, DEMANDA, EXPEDIENTE, FINADO
```

### Valores de Marca Folio
```
HOMONIMOS, ACTUALIZA_INE, BUEN_HISTORIAL, MOROSO,
MOROSO_EXPEDIENTE, CREDITO_AGENTE, ACLARACION
```

### Request Ejemplo
```json
{
  "entregado": true,
  "fecha_entrega_pagare": "2026-01-09",
  "nombre_quien_recibio": "MARIA LOPEZ",
  "parentesco_quien_recibio": "ESPOSA",
  "semaforo": "ENTREGADO",
  "entregado_cliente_at": "2026-01-09T10:30:00",
  "entregado_cliente_by": "gerente01"
}
```

### Response
```json
{
  "success": true,
  "code": "OK",
  "message": "Pagaré actualizado correctamente",
  "data": {
    "updated_fields": [
      "entregado",
      "fecha_entrega_pagare",
      "nombre_quien_recibio",
      "parentesco_quien_recibio",
      "semaforo",
      "entregado_cliente_at",
      "entregado_cliente_by"
    ]
  }
}
```

---

## Ejemplo de Implementación con Debounce

```typescript
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

function BuscarPersonaPagare({ gerencia, token }) {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscar = useCallback(
    debounce(async (texto: string) => {
      if (texto.length < 2) {
        setResultados([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/pagares/buscar-personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ termino: texto, gerencia })
        });
        const data = await res.json();
        if (data.success) {
          setResultados(data.data);
        }
      } finally {
        setLoading(false);
      }
    }, 400),
    [gerencia]
  );

  const crearPagare = async (prestamo_id: string) => {
    const res = await fetch('/api/pagares/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prestamo_id, usuario: 'sistema' })
    });
    const data = await res.json();

    if (data.success) {
      alert(`Pagaré creado: ${data.data.id_sistemas}`);
      buscar(termino); // Refrescar lista
    } else {
      alert(`Error: ${data.message}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={termino}
        onChange={(e) => {
          setTermino(e.target.value);
          buscar(e.target.value);
        }}
      />

      {loading && <p>Buscando...</p>}

      {resultados.map(item => (
        <div key={item.prestamo_id} className="resultado">
          <div>
            <strong>{item.nombre_completo}</strong>
            <span>{item.telefono}</span>
          </div>
          <div>
            Préstamo: {item.prestamo_id} |
            Monto: ${item.monto_prestamo.toLocaleString()}
          </div>
          <div>
            {item.tiene_pagare === 0 ? (
              <button onClick={() => crearPagare(item.prestamo_id)}>
                Crear Pagaré
              </button>
            ) : (
              <span className="badge-success">
                Pagaré: {item.id_sistemas}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Códigos de Error

| Code | HTTP | Descripción |
|------|------|-------------|
| OK | 200 | Operación exitosa |
| VALIDATION_ERROR | 400 | Datos de entrada inválidos |
| PRESTAMO_NO_ENCONTRADO | 400 | Préstamo no existe |
| PAGARE_YA_EXISTE | 400 | El préstamo ya tiene pagaré |
| PAGARE_NO_ENCONTRADO | 404 | Pagaré no existe |
| CAMPO_NO_EDITABLE | 400 | Campo no permitido para edición |
| VALOR_INVALIDO | 400 | Valor no válido para el campo |
| UNAUTHORIZED | 401 | Token inválido o faltante |
| INTERNAL_ERROR | 500 | Error del servidor |

---

## Ejemplos curl para Pruebas

> **Nota:** Reemplazar `https://elysia.xpress1.cc` por `http://localhost:3069` para desarrollo local.
> Reemplazar `<TOKEN>` por un token JWT válido en endpoints autenticados.

### 1. Buscar Personas con Préstamos

```bash
# Búsqueda básica por nombre
curl -X POST 'https://elysia.xpress1.cc/api/pagares/buscar-personas' \
  -H 'Content-Type: application/json' \
  -d '{"termino": "MARIA", "gerencia": "GERC001"}'
```

### 2. Crear Pagaré (requiere auth)

```bash
curl -X POST 'https://elysia.xpress1.cc/api/pagares/crear' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"prestamo_id": "12345-ca", "usuario": "admin"}'
```

### 3. Búsqueda de Pagarés con Filtros

```bash
# Filtro simple por gerencia
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "gerencia",
      "operator": "=",
      "value": "GERC001"
    },
    "page": 1,
    "limit": 20
  }'

# Filtro con operador IN (múltiples gerencias)
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "gerencia",
      "operator": "in",
      "value": ["GERC001", "GERC002"]
    },
    "page": 1,
    "limit": 20
  }'

# Filtro con operador includes (buscar en nombre)
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "cliente_nombre",
      "operator": "includes",
      "value": "MARIA"
    },
    "page": 1,
    "limit": 20
  }'

# Filtro con operador startsWith (id_sistemas que empieza con)
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "id_sistemas",
      "operator": "startsWith",
      "value": "02-26"
    },
    "page": 1,
    "limit": 20
  }'

# Filtro por semáforo nulo (sin estado asignado)
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "semaforo",
      "operator": "isNull"
    },
    "page": 1,
    "limit": 20
  }'

# Filtro por semáforo específico
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "semaforo",
      "operator": "=",
      "value": "ENTREGADO"
    },
    "page": 1,
    "limit": 20
  }'

# Filtros combinados con AND
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "group",
      "logic": "AND",
      "children": [
        {"type": "rule", "field": "gerencia", "operator": "=", "value": "GERC001"},
        {"type": "rule", "field": "semaforo", "operator": "isNull"}
      ]
    },
    "page": 1,
    "limit": 20
  }'

# Filtros combinados con OR
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "group",
      "logic": "OR",
      "children": [
        {"type": "rule", "field": "semaforo", "operator": "=", "value": "ENTREGADO"},
        {"type": "rule", "field": "semaforo", "operator": "=", "value": "PERDIDO"}
      ]
    },
    "page": 1,
    "limit": 20
  }'

# Filtro con between (rango de semanas)
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "semana_inicio",
      "operator": "between",
      "value": [1, 10]
    },
    "page": 1,
    "limit": 20
  }'

# Con ordenamiento y paginación
curl -X POST 'https://elysia.xpress1.cc/api/pagares/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {
      "type": "rule",
      "field": "gerencia",
      "operator": "=",
      "value": "GERC001"
    },
    "page": 2,
    "limit": 50,
    "sortBy": "created_at",
    "order": "desc"
  }'
```

### 4. Obtener Pagaré por ID

```bash
curl -X GET 'https://elysia.xpress1.cc/api/pagares/1'
```

### 5. Actualizar Pagaré (requiere auth)

```bash
# Marcar como entregado
curl -X PATCH 'https://elysia.xpress1.cc/api/pagares/1' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{
    "entregado": true,
    "semaforo": "ENTREGADO",
    "nombre_quien_recibio": "MARIA LOPEZ",
    "parentesco_quien_recibio": "ESPOSA"
  }'

# Actualizar observaciones
curl -X PATCH 'https://elysia.xpress1.cc/api/pagares/1' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"observaciones": "Cliente no encontrado en domicilio"}'

# Marcar semáforo como RETORNADO_NO_ENCONTRADO
curl -X PATCH 'https://elysia.xpress1.cc/api/pagares/1' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"semaforo": "RETORNADO_NO_ENCONTRADO"}'
```

### 6. Obtener Token de Autenticación

```bash
curl -X POST 'https://elysia.xpress1.cc/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username": "tu_usuario", "password": "tu_password"}'
```

---

## Notas de Implementación

1. **Debounce**: Usar 300-500ms en el campo de búsqueda de personas
2. **Paginación**: El límite máximo es 200 registros por página
3. **Filtros anidados**: Se pueden combinar múltiples niveles de AND/OR
4. **Case insensitive**: Los operadores `includes`, `startsWith`, `endsWith` ignoran mayúsculas/minúsculas
5. **Campos de solo lectura**: `id_sistemas`, `prestamo_id`, `gerencia`, `created_at` no son editables
