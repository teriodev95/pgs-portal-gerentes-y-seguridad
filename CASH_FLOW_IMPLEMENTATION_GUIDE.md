# Cash-Flow Feature Implementation Guide

**Contexto**: Vue 3 + TypeScript, arquitectura basada en features. Seguir exactamente los patrones del feature `expense`.

## Estructura Obligatoria

```
src/features/cash-flow/
├── components/          # Componentes Vue del feature
├── composables/         # useCashFlow.ts + useCashFlowErrorHandler.ts
├── constants/           # errorMessages.ts
├── services/           # cashFlow.service.ts (singleton, createApiClientFromPreset)
├── types/              # cashFlow.types.ts (interfaces TypeScript)
└── views/              # CashFlowView.vue
```

## Reglas Clave

### Composable Pattern (`useCashFlow.ts`)

```typescript
export function useCashFlow() {
  // 1. Services/Stores init
  // 2. State (ref)
  // 3. Computed (básicos + específicos)
  // 4. Validation functions (fuera del composable)
  // 5. Methods (async/await + try-catch-finally + handleError)
  // 6. Lifecycle (onBeforeMount)
  // 7. Return organizado { state, computed, methods }
}
```

### Servicio API

```typescript
class CashFlowService {
  private apiClient = createApiClientFromPreset('fastApi')
  async getCashFlow() { return this.apiClient.get<Type>() }
}
export const cashFlowService = new CashFlowService()
```

### Componentes

- `<script setup lang="ts">` con props/emits tipados
- Computed para validaciones
- `defineExpose` para métodos del padre
- Usar componentes de `@/shared/components`

### Error Handling

- `useCashFlowErrorHandler` composable
- `ERROR_MESSAGES` constantes tipadas
- Toast para feedback

## TypeScript Estricto

- ❌ NO `any`
- ✅ Interfaces en `types/`
- ✅ Tipar todo: props, emits, refs, returns

## Checklist de Implementación

### Necesito Saber

1. ¿Qué datos maneja? (para tipos TS)
2. ¿Qué endpoints? (para servicio)
3. ¿Qué componentes UI? (forms, lists, cards)
4. ¿Validaciones de negocio?

---

**TL;DR**: Clonar estructura de `expense`, usar TypeScript estricto, composables con patrón definido, servicios singleton, error handling con toast, componentes compartidos de `/shared`.
