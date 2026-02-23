# Guía de Testing - PWA Update Prompt

## Por qué el prompt NO aparece en `npm run dev`

El Service Worker con `onNeedRefresh` **solo funciona en builds de producción**, no en desarrollo con hot-reload (HMR) de Vite.

**Razón:**
- Vite HMR actualiza módulos sin recargar → SW no detecta "nueva versión"
- `onNeedRefresh` solo se dispara cuando hay un **nuevo SW en estado "waiting"**
- Esto ocurre cuando hay un nuevo build con cambios

---

## Métodos de Testing

### 🟢 Método 1: Build Preview (RECOMENDADO - Simula producción)

Este método simula exactamente cómo funcionará en producción.

#### Paso a paso:

```bash
# Terminal 1: Primer build
npm run build
npm run preview
```

Abre el navegador en **modo incógnito**: `http://localhost:4173`

```bash
# Terminal 2: Haz un cambio en el código
# Por ejemplo, edita src/App.vue y guarda

# Luego haz un nuevo build
npm run build
```

**Resultado esperado:**
1. El SW detecta nueva versión
2. Consola muestra: `Nueva versión disponible - se mostró prompt al usuario`
3. Aparece el drawer: "Actualización disponible"
4. Click en "Actualizar ahora" → página recarga con nueva versión

---

### 🟡 Método 2: Test Manual del Drawer (Solo UI)

Para verificar que el drawer funciona correctamente sin esperar actualización real.

#### Pasos:

1. Abre la app en cualquier modo (dev o preview)
2. Abre DevTools → Console
3. Ejecuta:

```javascript
window.dispatchEvent(new CustomEvent('pwa:update-available'))
```

**Resultado esperado:**
- Drawer aparece inmediatamente
- Muestra: "Actualización disponible"
- Botones "Actualizar ahora" / "Más tarde" funcionan

**Nota:** Esto solo prueba la UI, no el flujo completo de actualización.

---

### 🔵 Método 3: Forzar Update en DevTools

Para probar en cualquier build con SW activo.

#### Pasos:

1. Abre DevTools → Application → Service Workers
2. Verifica que haya un SW registrado
3. Haz un cambio en el código
4. Haz nuevo build (si estás en preview)
5. En DevTools, click en **"Update"** junto al SW
6. Si aparece un SW en estado "waiting", click en **"skipWaiting"**

**Resultado esperado:**
- `onNeedRefresh` se dispara
- Drawer aparece automáticamente

---

## Testing en Producción

### Flujo Completo:

```bash
# 1. Build y deploy inicial
npm run build
# Subir a servidor (commit + push)

# 2. Los usuarios abren la app
# SW se instala y cachea assets

# 3. Hacer cambios en el código
# Editar archivos, corregir bugs, etc.

# 4. Nuevo build y deploy
npm run build
# Subir a servidor (commit + push)

# 5. Usuario ya tiene la app abierta
# SW detecta nueva versión en background

# 6. onNeedRefresh se dispara
# Drawer aparece: "Actualización disponible"

# 7. Usuario hace click en "Actualizar ahora"
# - usePwaUpdate.applyUpdate() se ejecuta
# - Desregistra SW viejo
# - Limpia cachés
# - Recarga página
# - Usuario ve nueva versión
```

---

## Verificación en Producción

### Headers de caché (con curl):

```bash
# 1. index.html debe tener no-cache
curl -I https://tu-dominio.com/ | grep "Cache-Control"
# Expected: Cache-Control: no-cache, no-store, must-revalidate

# 2. Service Worker debe tener no-cache
curl -I https://tu-dominio.com/sw.js | grep "Cache-Control"
# Expected: Cache-Control: no-cache, no-store, must-revalidate

# 3. Assets hasheados deben tener immutable
curl -I https://tu-dominio.com/assets/index-abc12345.js | grep "Cache-Control"
# Expected: Cache-Control: public, immutable
```

### DevTools (navegador):

```javascript
// En consola del navegador

// 1. Verificar que SW está registrado
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs)
})

// 2. Ver estado de caché
caches.keys().then(names => {
  console.log('Cachés activas:', names)
})

// 3. Test manual del evento
window.dispatchEvent(new CustomEvent('pwa:update-available'))
```

---

## Troubleshooting

### ❌ "El drawer no aparece en producción"

**Verificar:**
1. ¿El SW está registrado? → DevTools → Application → Service Workers
2. ¿Hay consola de errores? → DevTools → Console
3. ¿El evento se dispara? → Agregar temporalmente:
   ```javascript
   // En main.ts
   onNeedRefresh() {
     console.log('🔄 onNeedRefresh disparado!')
     window.dispatchEvent(new CustomEvent('pwa:update-available'))
   }
   ```

### ❌ "Actualizar ahora no hace nada"

**Verificar:**
1. Consola de errores
2. Que `updateSW` se exporte correctamente de `main.ts`
3. Que `usePwaUpdate.applyUpdate()` se ejecute:
   ```javascript
   // Agregar log temporal en usePwaUpdate.ts
   const applyUpdate = async () => {
     console.log('🚀 applyUpdate ejecutado')
     // ... resto del código
   }
   ```

### ❌ "La app no actualiza en producción"

**Posibles causas:**
1. **CDN cacheando index.html** → Purgar caché de CDN
2. **nginx.conf no aplicado** → Verificar headers con curl
3. **cleanupOutdatedCaches: false** → Verificar vite.config.ts
4. **Browser cache muy agresivo** → Hard refresh (Ctrl+Shift+R)

**Solución:**
```bash
# Verificar que nginx.conf esté correcto
sudo nginx -t
sudo systemctl reload nginx

# Verificar headers
curl -I https://tu-dominio.com/
curl -I https://tu-dominio.com/sw.js
```

---

## Configuración Actual

### vite.config.ts
```typescript
VitePWA({
  registerType: "autoUpdate",
  workbox: {
    cleanupOutdatedCaches: true,  // ✅ Limpia cachés viejas
  },
  devOptions: {
    enabled: false,  // ✅ Deshabilitado en dev
  }
})
```

### main.ts
```typescript
export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa:update-available'))
    console.log('Nueva versión disponible - se mostró prompt al usuario')
  },
})
```

### nginx.conf
```nginx
# index.html - NUNCA cachear
location / {
  add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}

# Service Worker - NUNCA cachear
location ~ ^/(sw\.js|workbox-.*\.js|...)$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}

# Assets hasheados - Cachear 1 año
location ~* \.[a-f0-9]{8,}\.(js|css)$ {
  add_header Cache-Control "public, immutable" always;
}
```

---

## Checklist Pre-Deploy

Antes de cada deploy a producción, verificar:

- [ ] `cleanupOutdatedCaches: true` en vite.config.ts
- [ ] `onNeedRefresh` implementado en main.ts
- [ ] `PwaPrompt` componente en App.vue
- [ ] nginx.conf actualizado con estrategia de caché correcta
- [ ] Build exitoso: `npm run build`
- [ ] Test en preview: `npm run preview`
- [ ] Simular actualización (método 1) funciona correctamente

---

## Resumen

| Ambiente | Service Worker | Testing Method |
|----------|---------------|----------------|
| `npm run dev` | ❌ Deshabilitado | Método 2 (test manual) |
| `npm run preview` | ✅ Habilitado | Método 1 (build preview) |
| Producción | ✅ Habilitado | Flujo completo automático |

**Recomendación:** Siempre testear con `npm run preview` antes de hacer deploy a producción.
