# PGS: guardar pagos, ventas, gastos e incidencias con la semana de su fecha — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (o subagent-driven-development) para ejecutar tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Historia de usuario:** `0a7a088f-4345-43d0-95af-c5e1902f7199` (proyecto Xpress, MCP Daily Check).

**Written for:** el equipo de desarrollo de PGS que va a revisar y mergear la rama `dev`.

**Goal:** Que cada movimiento capturado en PGS se guarde con la semana Xpress que corresponde a la fecha de captura, obtenida del servidor (FAX `/calendario/actual`), y nunca con la semana 0 ni con una semana vieja del store.

**Architecture:** Un helper compartido `getSemanaActual()` pide la semana a FAX y valida la respuesta (semana y año > 0). Cada flujo de guardado (pago, venta, gasto, incidencia) llama al helper antes de armar el payload y deja de leer `$store.currentDate` para escribir. Si el helper falla, no se guarda nada y se muestra un aviso. La validación es una función pura, cubierta por tests con `bun test`.

**Tech Stack:** Vue 3 + TypeScript, Pinia, axios (`commonService` → FAX), `bun test` (`npm test` = `bun test src`).

## Global Constraints

- Ninguna escritura de semana sale de `$store.currentDate` en los flujos de guardado de pago, venta, gasto e incidencia.
- Semana válida: entero `1..53`; año entero `>= 2000`. Semana `0` nunca se guarda.
- Mensaje al usuario, exacto: `No se pudo obtener la semana, intenta de nuevo`.
- No se toca FAX ni la BD en esta rama. La corrección de los registros ya mal semaneados es un paso aparte (ver "Fuera de alcance").
- Rama de trabajo: `dev`. No se mergea ni se empuja a `main` sin confirmación explícita.

## Fuera de alcance (decisión explícita)

- **HU punto 2 (`useWeekDaySelector` deja de escribir en `$store.currentDate`):** no se toca en este plan. `useReport` (Reporte diario) lee la semana desde el store, así que quitar la escritura cambia la fuente de datos del reporte. Requiere pasar la semana por parámetro: se planea aparte. Este plan ya evita el daño (los guardados no leen el store), así que el criterio 2 de la HU se cumple sin tocarlo.
- **HU punto 4 (tabulador):** resuelto con la opción B (decisión 2026-11-06): `useMoneyTabulation` carga y guarda con la semana del servidor. El tabulador ya no muestra semanas pasadas; en BD, ninguna de las 2024 tabulaciones de 2026 se guardó en una semana distinta a su `created_at`, así que nadie usaba esa posibilidad.
- **HU punto 5 (candado en FAX `POST /pagos/`):** repo `fast-api-xpress-fax`, rama `dev`. Tarea independiente, opcional, no ejecutada en este plan.
- **Corrección de datos:** los pagos ya mal semaneados en `pagos_v3` (consulta de control en la HU) se corrigen con script aprobado, no con código.

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/shared/services/semana-validacion.ts` | Create | Validación pura de la respuesta de FAX (sin imports, testeable con `bun test`) |
| `src/shared/services/semana-actual.ts` | Create | `getSemanaActual()`: llama a FAX y usa la validación |
| `src/shared/services/__tests__/semana-actual.test.ts` | Create | Tests de la validación |
| `src/features/loan/composables/usePaymentManagement.ts` | Modify `processPayment` (líneas ~62-87) | Pago con semana del servidor |
| `src/features/sale/composables/useSaleData.ts` | Modify `saveSale` (líneas ~131-150) | Venta con semana del servidor |
| `src/features/expense/composables/useExpenseData.ts` | Modify `saveExpense` (líneas ~90-105) | Gasto con semana del servidor |
| `src/features/incident/composables/useIncidentData.ts` | Modify `saveIncident` (líneas ~102-112) | Incidencia con semana del servidor |

---

### Task 1: Helper de semana actual con tests

**Files:**
- Create: `src/shared/services/semana-actual.ts`
- Test: `src/shared/services/__tests__/semana-actual.test.ts`

**Interfaces:**
- Consumes: `commonService.getCurrentDate()` (en `src/shared/services/modules/common.ts:60`), que devuelve un axios response cuyo `data` es `{ semana: number; anio: number; desde: string; hasta: string }`.
- Produces:
  - `MSG_SEMANA_NO_DISPONIBLE: string`
  - `interface ISemanaActual { semana: number; anio: number }`
  - `validarSemanaActual(data: unknown): ISemanaActual` (lanza `Error(MSG_SEMANA_NO_DISPONIBLE)` si no es válida)
  - `getSemanaActual(): Promise<ISemanaActual>` (lanza el mismo error si la llamada falla o la respuesta no es válida)

- [ ] **Step 1: Escribir el test que falla**

Crear `src/shared/services/__tests__/semana-actual.test.ts`:

```ts
import { describe, expect, it } from 'bun:test'
import { MSG_SEMANA_NO_DISPONIBLE, validarSemanaActual } from '../semana-actual'

describe('validarSemanaActual', () => {
  it('acepta semana y año válidos de FAX', () => {
    expect(validarSemanaActual({ semana: 44, anio: 2026, desde: '2026-10-28', hasta: '2026-11-03' }))
      .toEqual({ semana: 44, anio: 2026 })
  })

  it('rechaza la semana 0 (valor inicial del store, nunca se guarda)', () => {
    expect(() => validarSemanaActual({ semana: 0, anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
  })

  it('rechaza año 0, semana fuera de rango y respuestas vacías o malformadas', () => {
    expect(() => validarSemanaActual({ semana: 44, anio: 0 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual({ semana: 54, anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual({ semana: 4.5, anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual({ anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual(null)).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual(undefined)).toThrow(MSG_SEMANA_NO_DISPONIBLE)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `bun test src/shared/services/__tests__/semana-actual.test.ts`
Expected: FAIL, `Cannot find module '../semana-actual'`.

- [ ] **Step 3: Implementación mínima**

Crear `src/shared/services/semana-actual.ts`:

```ts
import { commonService } from '@/shared/services/modules'

export const MSG_SEMANA_NO_DISPONIBLE = 'No se pudo obtener la semana, intenta de nuevo'

export interface ISemanaActual {
  semana: number
  anio: number
}

// shortcut: solo valida rango (1..53, año >= 2000); no compara contra calendario local. Subir a validación contra FAX si aparece semana 53 inválida.
export function validarSemanaActual(data: unknown): ISemanaActual {
  const d = data as { semana?: unknown; anio?: unknown } | null | undefined
  const semana = Number(d?.semana)
  const anio = Number(d?.anio)
  if (!Number.isInteger(semana) || semana < 1 || semana > 53) throw new Error(MSG_SEMANA_NO_DISPONIBLE)
  if (!Number.isInteger(anio) || anio < 2000) throw new Error(MSG_SEMANA_NO_DISPONIBLE)
  return { semana, anio }
}

export async function getSemanaActual(): Promise<ISemanaActual> {
  try {
    const { data } = await commonService.getCurrentDate()
    return validarSemanaActual(data)
  } catch {
    throw new Error(MSG_SEMANA_NO_DISPONIBLE)
  }
}
```

Nota: `Number(null)` es `0` y `Number(undefined)` es `NaN`; ambos fallan la validación.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `bun test src/shared/services/__tests__/semana-actual.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/semana-actual.ts src/shared/services/__tests__/semana-actual.test.ts
git commit -m "feat(semana): helper que obtiene la semana actual de FAX y rechaza semana 0"
```

---

### Task 2: Pago (`usePaymentManagement.processPayment`)

**Files:**
- Modify: `src/features/loan/composables/usePaymentManagement.ts` (imports y `processPayment`, líneas ~1-10 y ~62-87)

**Interfaces:**
- Consumes: `getSemanaActual(): Promise<ISemanaActual>`, `MSG_SEMANA_NO_DISPONIBLE` (Task 1). `showError` de `useNotification`.
- Produces: ninguna interfaz nueva.

- [ ] **Step 1: Verificar que `useNotification` exporta `showError`**

Run: `grep -n "showError" src/shared/composables/useNotification.ts`
Expected: al menos una línea con `showError`. Si no existe, usar `showWarning` en su lugar y anotarlo en el commit.

- [ ] **Step 2: Editar imports**

En `src/features/loan/composables/usePaymentManagement.ts`, reemplazar la línea:

```ts
import { useNotification } from '@/shared/composables/useNotification'
```

por:

```ts
import { useNotification } from '@/shared/composables/useNotification'
import { getSemanaActual } from '@/shared/services/semana-actual'
```

Y cambiar la desestructuración de `useNotification`:

```ts
  const { showWarning, showError } = useNotification()
```

- [ ] **Step 3: Obtener la semana del servidor antes de armar el pago**

En `processPayment`, justo después de `if (!selectedPayment.value) return false` y antes de `const payment = selectedPayment.value`, insertar:

```ts
    let semanaDeHoy: { semana: number; anio: number }
    try {
      semanaDeHoy = await getSemanaActual()
    } catch (error) {
      showError((error as Error).message)
      return false
    }
```

- [ ] **Step 4: Usar esa semana en el payload**

En el objeto `paymentData` de `processPayment`, reemplazar:

```ts
        anio: currentDate.value.year,
```
por
```ts
        anio: semanaDeHoy.anio,
```

y reemplazar:

```ts
        semana: currentDate.value.week,
```
por
```ts
        semana: semanaDeHoy.semana,
```

- [ ] **Step 5: Type-check**

Run: `npm run type-check`
Expected: sin errores nuevos en `usePaymentManagement.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/features/loan/composables/usePaymentManagement.ts
git commit -m "fix(pagos): el pago se guarda con la semana del servidor, no con la del store"
```

---

### Task 3: Venta, gasto e incidencia

**Files:**
- Modify: `src/features/sale/composables/useSaleData.ts` (`saveSale`, líneas ~131-150)
- Modify: `src/features/expense/composables/useExpenseData.ts` (`saveExpense`, líneas ~90-105)
- Modify: `src/features/incident/composables/useIncidentData.ts` (`saveIncident`, líneas ~102-112)

**Interfaces:**
- Consumes: `getSemanaActual()`, `MSG_SEMANA_NO_DISPONIBLE`, `ISemanaActual` (Task 1).

Patrón idéntico en las tres funciones. Antes de construir el objeto a guardar, obtener la semana; si falla, mostrar el aviso y rechazar la promesa, igual que las validaciones existentes de cada función.

- [ ] **Step 1: Venta**

En `src/features/sale/composables/useSaleData.ts`, dentro de `saveSale`, antes de `const saleData: SaleDetails = {`, insertar:

```ts
    let semanaDeHoy: { semana: number; anio: number }
    try {
      semanaDeHoy = await getSemanaActual()
    } catch (error) {
      showError((error as Error).message)
      return Promise.reject(error)
    }
```

Y en el objeto `saleData`, reemplazar:

```ts
      semana: currentDate.value.week,
      anio: currentDate.value.year,
```
por
```ts
      semana: semanaDeHoy.semana,
      anio: semanaDeHoy.anio,
```

Agregar el import `import { getSemanaActual } from '@/shared/services/semana-actual'`. Si `saveSale` no es `async`, marcarla `async` (las demás ramas ya usan `Promise.reject`, lo que es compatible). Verificar que `showError` ya está en uso en el archivo (sí, se usa en la validación).

- [ ] **Step 2: Gasto**

En `src/features/expense/composables/useExpenseData.ts`, dentro de `saveExpense`, antes del objeto que arma el gasto (el que contiene `semana: currentDate.value.week` en línea ~101), insertar el mismo bloque `let semanaDeHoy ...try/await/catch` del Step 1 usando `showError` del composable. Si el archivo no importa `showError`, importarlo de `useNotification` (verificar la ruta con `grep -n "useNotification" src/features/expense/composables/useExpenseData.ts`).

Reemplazar:

```ts
      semana: currentDate.value.week,
      anio: currentDate.value.year,
```
por
```ts
      semana: semanaDeHoy.semana,
      anio: semanaDeHoy.anio,
```

Agregar el import del helper.

- [ ] **Step 3: Incidencia**

En `src/features/incident/composables/useIncidentData.ts`, dentro de `saveIncident`, después del chequeo de `usuarioId` y antes de `const currentDateStr`, insertar el mismo bloque `try/await/catch` (rechazo con `Promise.reject(error)`).

Reemplazar:

```ts
      semana: currentDate.value.week,
      anio: currentDate.value.year,
```
por
```ts
      semana: semanaDeHoy.semana,
      anio: semanaDeHoy.anio,
```

Agregar el import del helper.

- [ ] **Step 4: Comprobar que no quedan escrituras desde el store en estos flujos**

Run: `grep -n "currentDate.value.week\|currentDate.value.year" src/features/sale/composables/useSaleData.ts src/features/expense/composables/useExpenseData.ts src/features/incident/composables/useIncidentData.ts src/features/loan/composables/usePaymentManagement.ts`
Expected: ninguna coincidencia dentro de las funciones de guardado. Las coincidencias de `loadPayments`, de la carga de listados y de `currentDate` como `computed` para lectura pueden quedar (esas no escriben semana de captura).

- [ ] **Step 5: Type-check y tests**

Run: `npm run type-check && bun test src`
Expected: type-check sin errores nuevos; tests existentes y los nuevos pasan.

- [ ] **Step 6: Commit**

```bash
git add src/features/sale/composables/useSaleData.ts src/features/expense/composables/useExpenseData.ts src/features/incident/composables/useIncidentData.ts
git commit -m "fix(ventas,gastos,incidencias): guardan con la semana del servidor, no con la del store"
```

---

### Task 4: Verificación en dev

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Suite completa**

Run: `bun test src`
Expected: todos PASS.

- [ ] **Step 2: Build sin type-check**

Run: `npm run build-only`
Expected: build exitoso.

- [ ] **Step 3: Consulta de control (solo lectura, BD)**

Ejecutar tras el deploy a dev, con la fecha del deploy. Expected: 0 filas nuevas de PGS con semana distinta a la de su fecha.

```sql
SELECT p.PagoID, p.Fecha_pago, p.Semana, c.semana AS semana_real
FROM pagos_v3 p
JOIN calendario c ON DATE(p.Fecha_pago) BETWEEN c.desde AND c.hasta
WHERE p.Comentario LIKE '%Llenado por el Gerente%'
  AND p.Semana <> c.semana
  AND p.Fecha_pago >= '<fecha del deploy>'
```

- [ ] **Step 4: Pruebas manuales en PGS dev (gerencia GERDC100)**

1. Abrir la app un martes, esperar al miércoles sin recargar y capturar un pago: debe quedar en la semana nueva.
2. Simular fallo de FAX (bloquear `/calendario/actual`): al capturar un pago debe salir `No se pudo obtener la semana, intenta de nuevo` y no aparecer el movimiento.
3. Repetir 1 y 2 para venta, gasto e incidencia.

---

## Criterios de aceptación (HU)

1. Pago capturado el miércoles con la app abierta desde el martes queda en la semana nueva. → Task 2 + Task 4 paso 4.1.
2. Consultar otra semana en Reporte diario y capturar: el pago queda en la semana actual. → cumplido porque el guardado ya no lee el store (Task 2). El store sigue cambiando por diseño (fuera de alcance).
3. Sin semana cargada, no se guarda nada con semana 0. → Task 1 + Task 4 paso 4.2.
4. Ventas, gastos e incidencias cumplen lo mismo. → Task 3 + Task 4 paso 4.3.
5. Probado en dev con GERDC100 antes de producción. → Task 4.
