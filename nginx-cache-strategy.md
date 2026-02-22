# Estrategia de Caché Nginx - PWA PGS

## Resumen de la Configuración

La nueva configuración de nginx implementa una estrategia de caché diferenciada que resuelve los problemas identificados en la auditoría de caché, asegurando que los archivos críticos nunca se cacheen mientras optimiza el rendimiento de assets estáticos.

---

## Estrategia por Tipo de Archivo

### 🔴 NUNCA CACHEAR (Critical - Always Fresh)

#### 1. Service Worker y Manifest
**Archivos:** `sw.js`, `workbox-*.js`, `service-worker.js`, `manifest.webmanifest`, `manifest.json`

```nginx
location ~ ^/(sw\.js|workbox-.*\.js|service-worker\.js|manifest\.webmanifest|manifest\.json)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}
```

**Por qué:** El Service Worker controla toda la estrategia de caché de la PWA. Si se cachea, los usuarios nunca recibirán actualizaciones.

#### 2. index.html (SPA Entry Point)
**Archivos:** `index.html` y todas las rutas de SPA

```nginx
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}
```

**Por qué:** `index.html` contiene las referencias a los archivos hasheados. Si se cachea, apuntará a versiones viejas de JS/CSS.

---

### 🟢 CACHEO AGRESIVO (Immutable - 1 año)

#### Assets Hasheados por Vite
**Archivos:** `app.abc123.js`, `index.def456.css` (con hash de 8+ caracteres)

```nginx
location ~* \.[a-f0-9]{8,}\.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable" always;
}
```

**Por qué:**
- Vite genera hashes únicos por contenido (ej: `app.7acaf368.js`)
- Si el contenido cambia, el hash cambia → nuevo filename
- `immutable` le dice al navegador: "este archivo NUNCA cambiará"
- Seguro usar 1 año porque un nuevo deploy genera nuevos hashes

**Ejemplo de archivos que matchean:**
- ✅ `assets/index-7acaf368.js` (hash: 7acaf368)
- ✅ `assets/index-fed91ecb.css` (hash: fed91ecb)
- ❌ `main.js` (sin hash, no matchea esta regla)

---

### 🟡 CACHEO MODERADO (30 días)

#### Imágenes, Fuentes e Iconos
**Archivos:** `.png`, `.jpg`, `.svg`, `.woff`, `.woff2`, `.ttf`, etc.

```nginx
location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000" always;
}
```

**Por qué:**
- Imágenes y fuentes cambian con poca frecuencia
- 30 días balancea rendimiento vs frescura
- Si cambian, se puede hacer cache busting manual o esperar 30 días

---

## Security Headers - Solución al Problema de Herencia

### Problema Original
En nginx, cuando usas `add_header` en un `location` block, **se eliminan TODOS los headers del nivel superior**.

```nginx
# ❌ ANTES (headers de seguridad se perdían en location blocks)
server {
    add_header X-Frame-Options "SAMEORIGIN";  # Solo aplica a rutas sin location específico
}
location /assets/ {
    add_header Cache-Control "public";  # Elimina X-Frame-Options
}
```

### Solución Implementada
Usar `always` flag y repetir headers en cada location:

```nginx
# ✅ DESPUÉS (headers se mantienen en todos los location blocks)
server {
    add_header X-Frame-Options "SAMEORIGIN" always;
}
location /assets/ {
    add_header Cache-Control "public" always;
    add_header X-Frame-Options "SAMEORIGIN" always;  # Se repite para mantener
}
```

**Headers de seguridad aplicados a TODO:**
- `X-Frame-Options: SAMEORIGIN` - Previene clickjacking
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Protección XSS legacy
- `Referrer-Policy: no-referrer-when-downgrade` - Control de referrer

---

## Flujo de Caché en un Deploy

### Antes (Problemático):
```
1. Usuario visita app → nginx sirve index.html cacheado (1 año)
2. index.html viejo apunta a → app.OLD_HASH.js (cacheado 1 año)
3. Usuario ve código viejo indefinidamente ❌
```

### Después (Correcto):
```
1. Usuario visita app → nginx sirve index.html FRESCO (no-cache)
2. index.html nuevo apunta a → app.NEW_HASH.js
3. Navegador descarga app.NEW_HASH.js (no existe en caché)
4. app.NEW_HASH.js se cachea por 1 año con immutable
5. Usuario ve código nuevo ✅
```

### En Actualizaciones Subsecuentes:
```
1. Usuario visita app → nginx sirve index.html FRESCO (no-cache)
2. index.html detecta mismo hash → app.NEW_HASH.js en caché
3. Navegador usa app.NEW_HASH.js de caché (immutable)
4. Carga instantánea ✅
```

---

## Testing de la Configuración

### Verificar Headers con curl

#### Test 1: index.html debe tener no-cache
```bash
curl -I https://tu-dominio.com/
# Expect: Cache-Control: no-cache, no-store, must-revalidate
```

#### Test 2: Service Worker debe tener no-cache
```bash
curl -I https://tu-dominio.com/sw.js
# Expect: Cache-Control: no-cache, no-store, must-revalidate
```

#### Test 3: Assets hasheados deben tener immutable
```bash
curl -I https://tu-dominio.com/assets/index-7acaf368.js
# Expect: Cache-Control: public, immutable
```

#### Test 4: Imágenes deben tener max-age
```bash
curl -I https://tu-dominio.com/icons/pgs-icon2.jpg
# Expect: Cache-Control: public, max-age=2592000
```

#### Test 5: Security headers en todos los endpoints
```bash
curl -I https://tu-dominio.com/ | grep -E "X-Frame|X-Content|X-XSS|Referrer"
curl -I https://tu-dominio.com/sw.js | grep -E "X-Frame|X-Content|X-XSS|Referrer"
# Todos deben tener los 4 headers de seguridad
```

---

## Archivos Afectados

| Archivo | Cambio Principal |
|---------|-----------------|
| `nginx.conf:35-46` | SW y manifest con no-cache + workbox-*.js incluido |
| `nginx.conf:50` | Regex específico para SOLO archivos hasheados |
| `nginx.conf:62-71` | Imágenes/fuentes con cacheo moderado (30d) |
| `nginx.conf:109-119` | index.html con no-cache + security headers |
| `nginx.conf:10-13` | Security headers globales con `always` |

---

## Compatibilidad con Workbox

Esta configuración trabaja en conjunto con la configuración de Workbox:

```typescript
// vite.config.ts
workbox: {
  cleanupOutdatedCaches: true,  // ✅ Limpia cachés viejas
  globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
}
```

**Flujo combinado:**
1. **Nginx:** Sirve `index.html` fresco → referencias a nuevos hashes
2. **Workbox:** Precachea nuevos assets hasheados
3. **Workbox:** Limpia cachés de assets viejos
4. **Usuario:** Ve versión actualizada

---

## Notas Importantes

⚠️ **Deployment:** Después de actualizar `nginx.conf`, reiniciar nginx:
```bash
sudo nginx -t  # Test de sintaxis
sudo systemctl reload nginx  # Reload sin downtime
```

⚠️ **CDN:** Si usas Cloudflare u otro CDN, asegúrate de:
- Purgar caché de `index.html` en cada deploy
- Configurar reglas de caché que respeten los headers de nginx

⚠️ **Vite Build:** Asegurarse que Vite está generando hashes:
```bash
npm run build
# Verificar en dist/assets/ que los archivos tengan hash:
# ✅ index-7acaf368.js
# ✅ index-fed91ecb.css
```

---

## Resultado Final

✅ `index.html` y `sw.js` NUNCA se cachean
✅ Assets hasheados se cachean agresivamente (1 año)
✅ Imágenes/fuentes tienen cacheo moderado (30 días)
✅ Security headers presentes en todas las respuestas
✅ Compatible con estrategia de Workbox/PWA

**Impacto:** Los usuarios reciben actualizaciones inmediatamente, mientras se mantiene rendimiento óptimo de assets estáticos.
