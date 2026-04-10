# Migración Angular 15 → 18 — Estado actual — ontimize-web-ngx-extra-components

> Última actualización: 10 abril 2026

## Repositorio y ramas

| Rama | Estado |
|------|--------|
| `15.x.x` | Base original, intocable |
| `18.x.x` | Rama destino (copia de 15.x.x) |
| `migration/16.x.x` | ✅ Completado |
| `migration/17.x.x` | ⏳ Pendiente |
| `migration/18.x.x` | ⏳ Pendiente |

**Ruta local**: `C:\work\ontimize-web-ngx\18.x.x\ontimize-web-ngx-extra-components`

---

## ESTADO GLOBAL

| Fase | Estado | Commit |
|------|--------|--------|
| Fase 1: Angular 15→16 | ✅ Completado | `ded1691` |
| Fase 2: Angular 16→17 | ⏳ Pendiente | — |
| Fase 3: Angular 17→18 | ⏳ Pendiente | — |

---

## FASES COMPLETADAS

### Fase 1: Angular 15 → 16 — commit `ded1691` (10 abril 2026)

**Rama**: `migration/16.x.x`

#### Dependencias actualizadas

| Paquete | De | A |
|---------|-----|-----|
| `@angular/*` | `^15.x` | `^16.2.0` |
| `@angular-eslint/*` | `15.x` | `^16.0.0` |
| `ng-packagr` | `^15.2.2` | `^16.2.0` |
| `typescript` | `~4.9.5` | `~5.0.4` |
| `zone.js` | `~0.12.0` | `~0.13.0` |
| `ngx-image-cropper` | `^7.2.1` | `^8.0.0` |
| `ngx-extended-pdf-viewer` | `18.0.0-beta.0` | `^19.0.0` |
| `ngx-skeleton-loader` | `7.0.0` | `^8.0.0` |
| `moment` | — | `^2.29.4` (nuevo, requerido por material-moment-adapter) |
| `ontimize-web-ngx` | `^15.8.1` (peer) | `^15.9.0` |
| `@ngbracket/ngx-layout` | — | `^16.0.0` (nuevo, transitional) |

**`tsconfig.json`**: `module` → `es2022`

#### Cambios en código fuente

- `o-image-editor.module.ts`: `ImageCropperModule` → `ImageCropperComponent`
  - `ngx-image-cropper@^8.0.0` eliminó el módulo, el componente es standalone directamente

#### Notas

- `@angular/flex-layout@^15.0.0-beta.42` se mantiene como peer transitorio (requerido por `ontimize-web-ngx@15.9.0`)
- `ontimize-web-ngx` no tiene versión 16 publicada en npm — se usa `^15.9.0` que es compatible en API

---

## PENDIENTE

### Fase 2: Angular 16 → 17 — Rama `migration/17.x.x`

- Actualizar Angular a `^17.x`, `ng-packagr` a `^17.x`, TypeScript a `~5.2.x`
- Verificar compatibilidad de terceros con Angular 17
- Actualizar `ontimize-web-ngx` si hay versión 16/17 publicada

### Fase 3: Angular 17 → 18 — Rama `migration/18.x.x`

- Actualizar Angular a `^18.x`
- Eliminar `@angular/flex-layout` / `@ngbracket/ngx-layout`
- Apuntar `ontimize-web-ngx` a `^18.0.0`
- Revisar APIs Material 18 (m2- prefixes o M3)

---

## WORKFLOW DE BUILD

```bash
export PATH="$HOME/AppData/Local/nvs/node/20.18.3/x64:$PATH"

cd C:/work/ontimize-web-ngx/18.x.x/ontimize-web-ngx-extra-components
npm install --legacy-peer-deps
npm run build
```
