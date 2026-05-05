# Plan: Migración Angular 15 → 18 — ontimize-web-ngx-extra-components

## TL;DR
Migración incremental del addon `ontimize-web-ngx-extra-components` (Angular 15 → 18) siguiendo la misma estrategia de ramas que el framework principal. La dependencia `ontimize-web-ngx` se actualiza en paralelo con cada fase. El peer `@angular/flex-layout` se sustituye por `@ngbracket/ngx-layout` a partir de la fase 17.

## Datos clave del codebase (reales)
- Dependencias externas clave: `ngx-image-cropper`, `ngx-extended-pdf-viewer`, `ngx-skeleton-loader`
- `FlexLayoutModule` de `@angular/flex-layout` importado en `o-components.ts`
- Sin standalone components en la versión base (15.x.x)
- Sin guards ni inyectores propios complejos

## Estrategia de Ramas

```
15.x.x (intocable)
  └── 18.x.x (punto de partida, copia de 15.x.x)
       ├── migration/16.x.x (Angular 16)
       │    └── migration/17.x.x (Angular 17)
       │         └── migration/18.x.x (Angular 18 final)
       └── (merge final a 18.x.x cuando esté listo)
```

---

## FASE 1: Angular 15 → 16 — Rama `migration/16.x.x` ✅ COMPLETADO

### Acciones realizadas
- Actualizar todas las dependencias Angular a `^16.2.0`
- `ng-packagr` → `^16.2.0`, `typescript` → `~5.0.4`, `zone.js` → `~0.13.0`
- Actualizar `tsconfig.json`: `module` → `es2022`
- Actualizar terceros: `ngx-image-cropper` → `^8.0.0` (ahora standalone), `ngx-extended-pdf-viewer` → `^19.0.0`, `ngx-skeleton-loader` → `^8.0.0`
- Añadir `moment` → `^2.29.4` (requerido por `@angular/material-moment-adapter`)
- Añadir `@ngbracket/ngx-layout@^16.0.0` (transitional)
- Mantener `@angular/flex-layout@^15.0.0-beta.42` como peer transitorio (requerido por `ontimize-web-ngx@15`)
- `ontimize-web-ngx` → `^15.9.0` (última versión 15 publicada)
- Actualizar `o-image-editor.module.ts`: `ImageCropperModule` → `ImageCropperComponent` (standalone en v8)

### Notas de compatibilidad
- `ontimize-web-ngx` no tiene versión 16 publicada en npm → usar `^15.9.0` (compatible en API pública)
- `ngx-image-cropper@^8.0.0` eliminó `ImageCropperModule`, exporta `ImageCropperComponent` standalone directamente

---

## FASE 2: Angular 16 → 17 — Rama `migration/17.x.x`

### Acciones previstas
- Actualizar todas las dependencias Angular a `^17.x`
- `ng-packagr` → `^17.x`, `typescript` → `~5.2.x`, `zone.js` → `~0.14.x`
- `@ngbracket/ngx-layout` → `^17.x` (verificar disponibilidad)
- Actualizar terceros si hay versión compatible Angular 17
- Actualizar `ontimize-web-ngx` → `^16.x` si se publica, si no mantener `^15.9.0`
- Control flow syntax opcional (`@if`, `@for`) si el tiempo lo permite

---

## FASE 3: Angular 17 → 18 — Rama `migration/18.x.x`

### Acciones previstas
- Actualizar todas las dependencias Angular a `^18.x`
- `ng-packagr` → `^18.x`, `typescript` → `~5.4.x`
- Reemplazar `@angular/flex-layout` + `@ngbracket/ngx-layout` por CSS nativo si se usa en templates
- Actualizar `o-components.ts`: `FlexLayoutModule` → clases CSS o eliminación si no se usa en templates
- Actualizar `ontimize-web-ngx` → `^18.0.0` (apuntando al tgz local o versión publicada)
- Revisar APIs de Angular Material 18 (prefijos `m2-` o migración a M3)
- Actualizar `@angular/material-moment-adapter` peer deps

---

## Verificación por fase

1. `npm run build` — debe compilar sin errores
2. Verificar que los componentes exportados son consumibles desde un proyecto Angular de la versión target

---

## Decisiones

- **flex-layout**: Mantener `@angular/flex-layout` como peer transitorio en Fases 1-2 (requerido por `ontimize-web-ngx@15`); eliminar en Fase 3
- **ontimize-web-ngx**: Usar `^15.9.0` en Fases 1-2 hasta que se publique versión 16/17/18
- **ngx-image-cropper**: Migrado a standalone en Fase 1 (`ImageCropperModule` → `ImageCropperComponent`)
- **Standalone**: No hay standalone components propios en el addon — no requiere migración de DI
