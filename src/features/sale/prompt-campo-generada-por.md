# Prompt — Campo `generadaPor` en registro de ventas

> Uso: pegar en **plan mode**. Primero investigar y proponer plan; no escribir código hasta aprobación.

---

## 1. Objetivo

Registrar **quién generó la venta** (`agente` o `gerente`) al crear una venta, capturándolo en el formulario de creación y enviándolo al backend en `createSale`.

---

## 2. Contexto verificado del repo

Archivos que participan en el flujo actual (crear venta):

| Archivo | Rol actual |
|---|---|
| `src/features/sale/types/sale.types.ts` | `SaleFormData` (campos del form) y `SaleDetails extends SaleFormData` (+ `anio`, `gerencia`, `semana`) |
| `src/features/sale/composables/useSaleForm.ts` | `defaultSaleForm`, estado `saleForm`, `validateForm()`, `submitForm()`, `clearForm()` |
| `src/features/sale/components/SaleForm.vue` | UI del formulario: patrón `LabelForm` + `InputGeneric`/`InputSelect` dentro de `.form-field` |
| `src/features/sale/composables/useSaleData.ts` | `saveSale()` arma `SaleDetails` y valida con `validateSaleData()` (validación duplicada respecto a `useSaleForm`) |
| `src/features/sale/services/sale.service.ts` | `createSale(sale: SaleDetails)` → `POST /ventas/` (preset `fastApi`); el payload se envía completo, sin mapeo campo por campo |
| `src/features/sale/components/SaleDrawer.vue` | Contenedor: modo crear (`SaleForm`) y modo detalle (`DataField`) |
| `src/features/sale/components/SalesItem.vue` | Tarjeta de la lista con `DataField` |

Referencia de interacción pedida (selector de opciones tipo "chips"):

- `src/features/loan/components/FormCreatePayment.vue` → bloques "¿Quién pagó?" / "¿Quién recuperó?": grid de `<p>` clicables con borde azul en el seleccionado. **No es un componente reutilizable, es markup inline repetido dos veces dentro de ese archivo.**
- Enums existentes en `src/features/loan/types/payment.types.ts`: `PaymentSource` (cliente/aval/referencia) y `RecoverySource` (agente/gerente/seguridad).

Componentes disponibles: `src/shared/components/forms/` (`InputGeneric`, `InputSelect`, `LabelForm`, …) y `src/components/ui/` (shadcn-vue: button, collapsible, dialog, drawer, stepper, tabs). **No existe** hoy un selector segmentado / radio-group / toggle-group compartido.

---

## 3. Requisitos funcionales

1. `generadaPor` es obligatorio, con exactamente dos valores: `agente` | `gerente`.
2. Se captura en el formulario de creación de venta (`SaleForm.vue`), no en un paso aparte.
3. Debe viajar en el body de `createSale` junto con el resto de `SaleDetails`.
4. Debe tener un valor por defecto en `defaultSaleForm` y restablecerse en `clearForm()`.
5. Debe quedar cubierto por la validación existente (decidir si en `validateForm` de `useSaleForm`, en `validateSaleData` de `useSaleData`, o ambos — hoy están duplicadas).
6. **Solo escritura:** el campo viaja en el POST, pero **no se muestra en la UI**. `SaleDrawer.vue` (modo detalle) y `SalesItem.vue` no se tocan.

---

## 4. Decisiones que el plan debe resolver explícitamente

Para cada una: elegir **una** opción, dar razón en 1–2 líneas y alinearla al manifiesto de `CLAUDE.md`.

**D1 — Tipo del valor.**
a) Union literal en `sale.types.ts` (`'agente' | 'gerente'`), consistente con `tipo` y `nivel` que ya son unions literales en ese archivo.
b) Nuevo `enum` local de la feature sale.
c) Reutilizar `RecoverySource` de la feature loan (tiene un tercer valor `seguridad` que **no** aplica aquí, e implica acoplar sale→loan).

**D2 — ¿Componente compartido o markup local?**
El md original pregunta si el selector califica para `src/shared`. Criterio de `CLAUDE.md`: *shared solo para piezas realmente reutilizadas por varios features*, y *no migrar legacy solo para normalizar*.
a) Markup local en `SaleForm.vue` (un solo consumidor hoy).
b) Componente compartido nuevo (ej. `src/shared/components/forms/InputOptionGroup.vue`) usado solo por sale.
c) Componente compartido **y** refactor de `FormCreatePayment.vue` para consumirlo (2 features, 3 usos) — mayor alcance y riesgo de regresión en cobranza/liquidaciones (`PaymentFormDrawer.vue`, `SettlementProcessor.vue`).
→ Si se elige (b) o (c), definir contrato mínimo: `v-model`, `options`, `label`, `disabled`. Sin props especulativas.

**D3 — Patrón de UI para 2 opciones.**
Con solo dos valores mutuamente excluyentes, evaluar cuál reduce más la carga cognitiva y mantiene consistencia con el resto de `SaleForm.vue` (que hoy es todo `InputSelect`):
a) Chips lado a lado (patrón `FormCreatePayment`, 2 columnas).
b) Segmented control / toggle de dos estados.
c) `InputSelect` con dos opciones (máxima consistencia, mínima fricción de implementación, peor affordance).
→ Justificar con los principios de la sección 6, no por gusto.

**D4 — Ubicación dentro del formulario.** En qué punto del orden actual de campos entra `generadaPor` y por qué (agrupación semántica con los datos de la venta vs. al final antes de Guardar).

---

## 5. Restricciones

- Cumplir `CLAUDE.md`: solución más directa que encaje con el código existente; sin composables, stores, wrappers ni props sin caso de uso actual.
- No refactorizar `useSaleForm` / `useSaleData` más allá de lo que exige este campo. Si se detecta la duplicación de validación, **señalarla** en el plan; corregirla solo si cabe como micro-mejora dentro del scope.
- Mantener el patrón visual de `SaleForm.vue` (`.form-field`, `LabelForm`, Tailwind, sin CSS nuevo salvo lo necesario).
- TypeScript estricto: sin `any`, sin casts para esquivar el tipo.
- Verificación obligatoria al final: `npm run type-check` y `npm run lint`.

---

## 6. Principios UI/UX a aplicar

Aplicar los que correspondan y **nombrar cuáles** se aplicaron en la propuesta:

1. **Semantic UX Writing** — etiqueta y microcopy inequívocos (definir el texto exacto: p. ej. "¿Quién generó la venta?" vs. "Generada por").
2. **Visual Affordance** — los elementos interactivos deben verse interactivos (estado hover/focus/selected, no solo color de borde).
3. **Visual Hierarchy** — jerarquía por contraste, escala y espaciado.
4. **Cognitive Load Reduction** — dos opciones no deberían requerir abrir un menú ni leer dos veces.
5. **Systemic Consistency** — coherencia con el resto del formulario y con patrones ya existentes en la app.
6. **Immediate Feedback** — la selección se percibe al instante y sin ambigüedad.
7. **Discoverability** — el campo no debe pasar desapercibido dentro del scroll del drawer.
8. **Contextual Interaction Design** — mostrar solo lo relevante al contexto de crear venta.
9. **Invisible Complexity** — el enum es un detalle técnico; el usuario ve dos roles.
10. **Operational Clarity** — siempre claro qué está seleccionado y qué falta para poder guardar.

Accesibilidad mínima: si se usan chips clicables, deben ser accesibles por teclado (`tabindex`/`role`/`aria-pressed` o inputs radio nativos). Nota: el patrón de `FormCreatePayment.vue` usa `<p>` con `tabindex` pero sin manejo de `Enter`/`Space` — no copiar ese defecto.

---

## 7. Criterios de aceptación

- [ ] Crear una venta envía `generadaPor` con valor `agente` o `gerente` en el POST a `/ventas/`.
- [ ] No se puede guardar sin un valor válido (o hay default explícito y documentado; decidir y justificar cuál).
- [ ] `clearForm()` restablece `generadaPor` al default.
- [ ] `npm run type-check` y `npm run lint` pasan sin errores nuevos.
- [ ] El campo es operable con teclado y su estado seleccionado es visualmente inequívoco.
- [ ] Ningún archivo fuera del alcance acordado quedó modificado.

---

## 8. Fuera de alcance

- Mostrar `generadaPor` en la lista (`SalesItem.vue`) o en el detalle (`SaleDrawer.vue`). Decisión tomada: por ahora no se despliega.
- Filtrar, agrupar o reportar ventas por `generadaPor`.
- Editar ventas ya creadas o migrar registros históricos.
- Cambiar el flujo de cobranza/liquidaciones, salvo que el plan elija D2(c) y lo declare explícitamente.
- Refactor general de `FormCreatePayment.vue` por razones de estilo.

---

## 9. Estado del backend y decisiones pendientes

**Confirmado:**

- El backend FastAPI ya acepta y persiste `generadaPor` en `POST /ventas/`. El trabajo es únicamente de front: no hay que negociar contrato ni esperar despliegue.
- El campo es **write-only en esta entrega**: no se consume ni se renderiza desde el `GET /ventas/`. No agregar `generadaPor` a la vista de detalle ni a la tarjeta de la lista.

Pendiente de decidir en el plan:

1. **Default:** ¿arranca en `agente`, en `gerente`, o sin selección forzando una elección consciente? (Impacta el criterio de aceptación 2.)

---

## 10. Entregable esperado del plan

1. Decisión de D1–D4 con justificación breve.
2. Lista exacta de archivos a crear/modificar, con el cambio concreto por archivo.
3. Copy final de etiqueta y opciones.
4. Riesgos de la opción elegida en D2 (alcance del refactor) y cómo verificarlos.
5. Pasos de verificación manual en la app además de type-check y lint.
