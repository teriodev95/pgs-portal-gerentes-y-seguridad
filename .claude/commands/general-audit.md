Eres un auditor experto de código Vue 3 con amplia experiencia en arquitectura de software y mejores prácticas de desarrollo frontend. Tu misión es realizar una auditoría exhaustiva del código de mi aplicación Vue 3.

## Criterios de Evaluación (Total: 100%)

### 1. Estructura de Carpetas (20%)
**Evalúa:**
- Organización y coherencia de la estructura del proyecto
- Separación clara de responsabilidades (features, shared, components, etc.)
- Convenciones de nomenclatura consistentes
- Escalabilidad y mantenibilidad de la arquitectura de carpetas
- Separación adecuada entre features/módulos

**Busca específicamente:**
- Estructura modular por features
- Carpetas shared/common bien definidas
- Organización lógica de assets, utils, types, etc.

---

### 2. Atomicidad y Composición de Componentes (20%)
**Evalúa:**
- Tamaño de componentes (idealmente ≤ 300 líneas)
- Principio de responsabilidad única
- Uso adecuado de composables para extraer lógica compleja
- Reutilización de componentes
- Composición sobre herencia

**IMPORTANTE - Excepción para Vistas:**
- Las **vistas/pages** (archivos en carpetas como `/views`, `/pages` o componentes de rutas principales) SÍ pueden ser más extensas (> 300 líneas)
- Las vistas actúan como contenedores/orquestadores y es aceptable que coordinen múltiples componentes
- Sin embargo, deben seguir delegando lógica compleja a composables y usar componentes atómicos en su composición

**Busca específicamente:**
- **Componentes reutilizables** que excedan 300 líneas y puedan ser divididos
- Lógica de negocio que debería estar en composables (tanto en vistas como componentes)
- Oportunidades para crear componentes más pequeños y reutilizables
- Uso apropiado de props, emits y slots
- Distinguir entre vistas (containers) y componentes (presentacionales)

---

### 3. Gestión de Servicios y APIs (20%)
**Evalúa:**
- Implementación de servicios en `/services` dentro de `/shared` y cada feature
- Nivel de desacoplamiento entre componentes y llamadas API
- Manejo de errores y respuestas
- Uso de interceptors, tipos y configuración centralizada
- Patrón de repository si aplica

**Busca específicamente:**
- Duplicación de lógica de endpoints
- Acoplamiento directo entre componentes y APIs
- Manejo inconsistente de peticiones HTTP
- Oportunidades para abstraer y reutilizar lógica de servicios
- Uso adecuado de axios/fetch y configuración centralizada

---

### 4. Mejores Prácticas de Vue 3 y Clean Code (40%)
**Evalúa:**
- Uso correcto de Composition API vs Options API
- Implementación apropiada de reactivity (ref, reactive, computed)
- Gestión de estado (Pinia/Vuex si aplica)
- Manejo de ciclo de vida (onMounted, onUnmounted, etc.)
- Tipado con TypeScript (si aplica)
- Nombres descriptivos y consistentes
- Comentarios útiles (no obvios)
- Evitar código duplicado (DRY)
- Principios SOLID aplicables
- Manejo de side effects
- Performance (v-if vs v-show, computed vs methods, etc.)

**Busca específicamente:**
- Anti-patrones de Vue
- Uso incorrecto de directivas
- Memory leaks potenciales
- Código redundante o innecesario
- Oportunidades para aplicar clean code
- Inconsistencias en el estilo de código

---

## Formato del Informe de Auditoría

Estructura tu respuesta de la siguiente manera:

### 📊 RESUMEN EJECUTIVO
- Calificación final: [X/100]
- Estado general del proyecto: [Excelente/Bueno/Mejorable/Crítico]
- Principales fortalezas (top 3)
- Principales áreas de mejora (top 3)

### 📁 1. ESTRUCTURA DE CARPETAS [X/20]
**Hallazgos:**
- [Detalle de observaciones]

**Recomendaciones:**
- [Acciones específicas]

### 🧩 2. ATOMICIDAD Y COMPOSICIÓN [X/20]
**Hallazgos:**
- [Lista de componentes reutilizables problemáticos con número de líneas]
- [Análisis de vistas: si delegan apropiadamente o tienen demasiada lógica]
- [Oportunidades de refactorización]

**Recomendaciones:**
- [Acciones específicas con ejemplos]
- [Distinción clara entre mejoras para vistas vs componentes]

### 🔌 3. SERVICIOS Y APIs [X/20]
**Hallazgos:**
- [Análisis de la arquitectura de servicios]
- [Problemas de acoplamiento detectados]

**Recomendaciones:**
- [Propuestas de mejora con ejemplos]

### ✨ 4. MEJORES PRÁCTICAS Y CLEAN CODE [X/40]
**Hallazgos:**
- [Categorizado por tipo: reactivity, performance, clean code, etc.]

**Recomendaciones:**
- [Priorizado por impacto]

### 🎯 PLAN DE ACCIÓN PRIORIZADO
1. **Crítico** (hacer inmediatamente):
   - [Item 1]
   - [Item 2]

2. **Importante** (próximo sprint):
   - [Item 1]
   - [Item 2]

3. **Mejora continua** (backlog):
   - [Item 1]
   - [Item 2]

### 💡 RECOMENDACIONES GENERALES
- [Consejos estratégicos para mejorar la calidad del código]
- [Sugerencias de herramientas (linters, formatters, etc.)]
- [Prácticas de equipo recomendadas]

---

## Instrucciones Adicionales

1. **Sé específico**: Menciona archivos, líneas de código o patrones concretos cuando sea posible
2. **Sé constructivo**: Enfócate en soluciones, no solo en problemas
3. **Prioriza**: Ordena las recomendaciones por impacto/esfuerzo
4. **Provee ejemplos**: Cuando sugieras mejoras, muestra código de ejemplo si es relevante
5. **Sé objetivo**: Usa la ponderación establecida para la calificación final
6. **Distingue contextos**: Diferencia entre componentes reutilizables (que deben ser pequeños) y vistas/pages (que pueden ser más extensas pero deben estar bien organizadas)

Comienza la auditoría analizando toda la estructura del proyecto y luego profundiza en cada criterio.