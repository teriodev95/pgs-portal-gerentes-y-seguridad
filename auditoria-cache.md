# Auditoría PWA - Problemas de Caché

## Resumen del problema

Los usuarios reportan que errores ya corregidos en producción siguen apareciendo en la PWA. Esto se debe a **múltiples problemas en la estrategia de caché** que provocan que los dispositivos de los usuarios sigan sirviendo versiones antiguas del código incluso después de un nuevo despliegue.

---

## Hallazgos Críticos

### 1. `cleanupOutdatedCaches: false` — LA CAUSA PRINCIPAL

**Archivo:** `vite.config.ts:30`

```ts
workbox: {
  cleanupOutdatedCaches: false, // ← PROBLEMA CRÍTICO
}
```

**Impacto:** Cuando se despliega una nueva versión, Workbox genera un nuevo precache manifest con hashes actualizados. Pero al tener `cleanupOutdatedCaches: false`, **las versiones anteriores de los archivos cacheados NO se eliminan**. Esto significa que:

- Los archivos JS/CSS antiguos permanecen en la caché del service worker indefinidamente
- Se acumulan versiones obsoletas en el almacenamiento del dispositivo
- El service worker puede seguir sirviendo assets antiguos si hay conflictos de resolución

**Solución:** Cambiar a `cleanupOutdatedCaches: true`.

---

### 2. Callbacks `onNeedRefresh` y `onOfflineReady` comentados

**Archivo:** `src/main.ts:22-26`

```ts
registerSW({
  immediate: true
  // onNeedRefresh() {},    ← COMENTADO
  // onOfflineReady() {},   ← COMENTADO
})
```

**Impacto:** Aunque `registerType: "autoUpdate"` activa el nuevo SW automáticamente, **no hay ningún mecanismo para forzar la recarga de la página** cuando el nuevo SW toma control. El flujo actual es:

1. Usuario abre la app → se sirve desde caché viejo
2. SW nuevo se descarga en background → se activa automáticamente
3. **Pero la página actual sigue mostrando el código viejo** hasta que el usuario cierre TODAS las pestañas y vuelva a abrir

Sin `onNeedRefresh`, el usuario nunca recibe una notificación de que hay una nueva versión disponible y debe recargar.

**Solución:** Implementar `onNeedRefresh` para mostrar un prompt al usuario o forzar `window.location.reload()`.

---

### 3. Conflicto entre Nginx y Workbox en el cacheo de assets estáticos

**Archivo:** `nginx.conf:48-51`

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";  # ← PROBLEMA
}
```

**Impacto:** Nginx marca TODOS los archivos `.js` y `.css` como `immutable` con expiración de 1 año. Esto crea una **doble capa de caché problemática**:

1. **Capa 1 - Browser HTTP Cache:** El navegador almacena los archivos con `immutable` → **nunca revalida** con el servidor, ni siquiera con F5
2. **Capa 2 - Service Worker Cache (Workbox):** Workbox precachea los mismos archivos en CacheStorage

Aunque Vite genera filenames con hash (ej: `app.abc123.js`), el problema ocurre cuando:
- El `index.html` viejo (que apunta a `app.OLD_HASH.js`) se sirve desde el SW cache
- El navegador encuentra `app.OLD_HASH.js` en su HTTP cache con `immutable`
- **Nunca va al servidor a buscar la versión nueva**

**Nota:** Los archivos con hash en Vite sí pueden usar `immutable` de forma segura, PERO solo si `index.html` siempre se sirve fresco. El problema está en que la combinación con `cleanupOutdatedCaches: false` rompe esta garantía.

---

### 4. `clearCacheAndReload` no desregistra el Service Worker

**Archivo:** `src/shared/composables/usePwaUpdate.ts:9-36`

```ts
const clearCacheAndReload = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
  }
  window.location.href = '/'
}
```

**Impacto:** Esta función borra las cachés del CacheStorage, pero:

- **No desregistra el service worker** → el SW viejo sigue activo y puede re-crear las cachés inmediatamente
- **No espera a que el nuevo SW tome control** → hay una race condition donde el SW viejo re-popula las cachés antes de que el nuevo se active
- `window.location.href = '/'` no fuerza bypass de caché del navegador (HTTP cache layer)

**Solución:** Desregistrar el SW, limpiar cachés, y luego recargar:
```ts
const registrations = await navigator.serviceWorker.getRegistrations()
await Promise.all(registrations.map(r => r.unregister()))
// Luego limpiar cachés y recargar
```

---

### 5. Herencia rota de headers en Nginx

**Archivo:** `nginx.conf:16` vs `nginx.conf:48-51`

```nginx
# Nivel server (línea 16)
add_header Cache-Control "no-cache" always;

# Nivel location para assets (línea 48-51)
location ~* \.(js|css|...)$ {
    add_header Cache-Control "public, immutable";  # Reemplaza TODO del nivel superior
}
```

**Impacto:** En Nginx, cuando se usa `add_header` en un bloque `location`, **se eliminan TODOS los headers heredados del nivel superior**. Esto significa que los assets estáticos pierden:
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

Esto es un problema de seguridad, aunque no directamente relacionado con el caché.

---

### 6. Sin estrategia de runtime caching para llamadas API

**Archivo:** `vite.config.ts:28-34`

```ts
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  // No hay runtimeCaching configurado
}
```

**Impacto:** Workbox solo maneja **precaching** de assets estáticos. No hay ninguna estrategia para:
- Llamadas API (NetworkFirst, StaleWhileRevalidate, etc.)
- Respuestas dinámicas

Esto no causa directamente el problema de versiones viejas, pero es relevante para el comportamiento offline y la percepción de datos "desactualizados".

---

## Diagrama del flujo problemático actual

```
Usuario abre la PWA
       │
       ▼
Service Worker intercepta → Sirve index.html VIEJO desde cache
       │
       ▼
index.html viejo referencia → app.OLD_HASH.js
       │
       ▼
Browser HTTP cache tiene app.OLD_HASH.js con "immutable"
       │
       ▼
Se muestra la versión VIEJA de la app (con bugs ya corregidos)
       │
       ▼
En background: SW nuevo se descarga y activa
       │
       ▼
Pero la página actual NO se recarga → usuario sigue viendo versión vieja
       │
       ▼
Solo al cerrar TODAS las pestañas y reabrir → se muestra versión nueva
(y aún así, cachés viejas persisten por cleanupOutdatedCaches: false)
```

---

## Resumen de archivos involucrados

| Archivo | Problema |
|---|---|
| `vite.config.ts:30` | `cleanupOutdatedCaches: false` |
| `src/main.ts:22-26` | `onNeedRefresh` comentado, sin mecanismo de recarga |
| `nginx.conf:48-51` | Assets marcados `immutable` con 1 año de expiración |
| `nginx.conf:16` | Header global sobreescrito por locations |
| `src/shared/composables/usePwaUpdate.ts` | No desregistra SW, race condition |
| `vite.config.ts:28-34` | Sin `runtimeCaching` para APIs |

---

## Prioridad de corrección sugerida

1. **URGENTE:** `cleanupOutdatedCaches: true` en `vite.config.ts`
2. **URGENTE:** Implementar `onNeedRefresh` en `main.ts` para forzar recarga o mostrar prompt
3. **ALTA:** Mejorar `clearCacheAndReload` para desregistrar el SW correctamente
4. **MEDIA:** Revisar estrategia de cache en nginx (los archivos hasheados están bien con `immutable`, pero asegurar que `index.html` y `sw.js` nunca se cacheen)
5. **BAJA:** Agregar `runtimeCaching` para llamadas API si se desea soporte offline
6. **BAJA:** Corregir herencia de security headers en nginx
