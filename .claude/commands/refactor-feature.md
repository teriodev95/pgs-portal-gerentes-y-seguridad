# Análisis de Arquitectura de Feature

## Contexto
Necesito que analices la estructura y arquitectura de un feature específico en el proyecto, evaluando si sigue las mejores prácticas establecidas.

## Referencia
Usa como referencia el **feature/expense**, que ya implementa todas las buenas prácticas que queremos mantener consistentes en el proyecto.

## Directorios a Analizar
Revisa exhaustivamente todos los directorios relevantes:
- `components/` - Componentes del feature
- `composables/` - Lógica reutilizable 
- `constants/` - Constantes y configuraciones
- `services/` - Servicios y llamadas API
- `views/` - Vistas principales
- `types/` (si existe) - Definiciones de tipos
- Cualquier otro directorio relacionado con el feature

## Criterios de Evaluación

### 1. Componentes Atómicos ⚛️
**Objetivo**: Verificar que existen componentes atómicos suficientes para hacer las vistas mantenibles

**Evalúa:**
- ¿Se han extraído componentes reutilizables apropiados?
- ¿Los componentes siguen el principio de responsabilidad única?
- ¿Se evita la duplicación de código en las vistas?
- ¿Los componentes tienen un nivel de abstracción adecuado?

**⚠️ Importante**: No sugieras sobre-ingeniería que complique innecesariamente la implementación.

### 2. Composables 🔧
**Objetivo**: Verificar la correcta separación de lógica de negocio

**Evalúa:**
- ¿Existe un composable principal que maneje la lógica del feature?
- ¿Hay un composable dedicado para manejo de errores?
- ¿Los composables están bien estructurados y son reutilizables?
- ¿La lógica está correctamente separada de la presentación?

### 3. Constantes 📋
**Objetivo**: Verificar que las constantes están correctamente organizadas

**Evalúa:**
- ¿Se han extraído todas las constantes necesarias?
- ¿Están organizadas de manera lógica y accesible?
- ¿Se evitan valores mágicos en el código?

## Formato de Respuesta Esperado

### Resumen Ejecutivo
- Estado general del feature (✅ Cumple / ⚠️ Parcial / ❌ No cumple)
- Principales fortalezas encontradas
- Áreas críticas de mejora

### Análisis Detallado

#### Componentes Atómicos
- Lista de componentes encontrados
- Evaluación de su diseño y reutilización
- Componentes faltantes (si aplica)
- Recomendaciones específicas

#### Composables
- Composables existentes y su propósito
- Calidad de la separación de lógica
- Manejo de errores
- Mejoras sugeridas

#### Constantes
- Organización actual
- Constantes que podrían extraerse
- Sugerencias de estructura

### Recomendaciones Prioritarias
1. **Alta prioridad**: Cambios críticos para mantener consistencia
2. **Media prioridad**: Mejoras que aumentarían la mantenibilidad  
3. **Baja prioridad**: Optimizaciones opcionales

### Comparación con feature/expense
- Similitudes con la implementación de referencia
- Diferencias significativas encontradas
- Nivel de consistencia arquitectural

---
**Nota**: Mantén un enfoque pragmático, priorizando la mantenibilidad y consistencia sobre la perfección teórica.