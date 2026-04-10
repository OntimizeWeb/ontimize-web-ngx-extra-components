# Migración Angular 15 → 18 — Estado actual — ontimize-web-ngx-extra-components

> Última actualización: 10 abril 2026 (sesión 2)

## Repositorio y ramas

| Rama | Estado |
|------|--------|
| `15.x.x` | Base original, intocable |
| `18.x.x` | Rama destino (copia de 15.x.x) |
| `migration/16.x.x` | ✅ Completado |
| `migration/17.x.x` | ✅ Completado |
| `migration/18.x.x` | ✅ Completado |

**Ruta local**: `C:\work\ontimize-web-ngx\18.x.x\ontimize-web-ngx-extra-components`

---

## ESTADO GLOBAL

| Fase | Estado | Commit |
|------|--------|--------|
| Fase 1: Angular 15→16 | ✅ Completado | `ded1691` |
| Fase 2: Angular 16→17 | ✅ Completado | `3c29244` |
| Fase 3: Angular 17→18 | ✅ Completado | `9b92ca1` |

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

### Fase 2: Angular 16 → 17 — commit `3c29244` (10 abril 2026)

**Rama**: `migration/17.x.x`

| Paquete | De | A |
|---------|-----|-----|
| `@angular/*` | `^16.2.0` | `^17.3.0` |
| `@angular-eslint/*` | `^16.0.0` | `^17.0.0` |
| `ng-packagr` | `^16.2.0` | `^17.3.0` |
| `typescript` | `~5.0.4` | `~5.2.2` |
| `zone.js` | `~0.13.0` | `~0.14.0` |
| `@ngbracket/ngx-layout` | `^16.0.0` | `^17.0.1` |

Sin cambios en código fuente.

---

### Fase 3: Angular 17 → 18 — commit `9b92ca1` (10 abril 2026)

**Rama**: `migration/18.x.x`

| Paquete | De | A |
|---------|-----|-----|
| `@angular/*` | `^17.3.0` | `^18.2.0` |
| `@angular-eslint/*` | `^17.0.0` | `^18.0.0` |
| `ng-packagr` | `^17.3.0` | `^18.2.0` |
| `typescript` | `~5.2.2` | `~5.5.4` |
| `luxon` | — | `^3.4.0` (nuevo, peer de ngx-material-timepicker transitivo) |
| `@types/luxon` | — | `^3.4.0` (nuevo) |
| `@angular/flex-layout` | `^15.0.0-beta.42` | eliminado |
| `@ngbracket/ngx-layout` | `^17.0.1` | eliminado |
| `ontimize-web-ngx` | `^15.9.0` | `file:../ontimize-web-ngx/dist/ontimize-web-ngx-18.0.0-SNAPSHOT-0.tgz` |

**Cambios en código fuente**:
- `o-components.ts`: eliminado `FlexLayoutModule` (import y uso en `OEXTRACOMPONENTS_IMPORTS_MODULES`)

---

## FASE 4: Standalone migration — commit `8b294f4` (10 abril 2026)

**Rama**: `migration/18.x.x`

| Componente / Directiva | Cambio |
|---|---|
| `OSkeletonComponent` | `standalone: true`, imports `NgxSkeletonLoaderModule` |
| `OImageEditorComponent` | `standalone: true`, imports `CommonModule`, `ImageCropperComponent`, `OntimizeWebModule` |
| `ODataViewComponent` | `standalone: true`, imports `CommonModule`, `OTableModule`, `OGridModule`, `OButtonToggleModule`, directivas propias |
| `ODataViewTableColumnsDirective` | `standalone: true` |
| `ODataViewGridItemDirective` | `standalone: true` |
| `OImageEditorModule` | Convertido a wrapper NgModule (`imports: [OImageEditorComponent]`) |
| `ODataViewModule` | Convertido a wrapper NgModule (`imports/exports` standalone components) |
| `OExtraComponentsModule` | `declarations: []`, `OSkeletonComponent` movido a `imports` y `exports` |

---

## PENDIENTE

Ninguno — migración completa ✅

---

## WORKFLOW DE BUILD

```bash
export PATH="$HOME/AppData/Local/nvs/node/20.18.3/x64:$PATH"

cd C:/work/ontimize-web-ngx/18.x.x/ontimize-web-ngx-extra-components
npm install --legacy-peer-deps
npm run build
```
