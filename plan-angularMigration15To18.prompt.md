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

## FASE 2: Angular 16 → 17 — Rama `migration/17.x.x` ✅ COMPLETADO

### Acciones realizadas
- Actualizar todas las dependencias Angular a `^17.3.0`
- `ng-packagr` → `^17.3.0`, `typescript` → `~5.2.2`, `zone.js` → `~0.14.0`
- `@ngbracket/ngx-layout` → `^17.0.1`
- `@angular-eslint/*` → `^17.0.0`
- `ontimize-web-ngx` → mantenido en `^15.9.0` (no hay versión 16/17 publicada)
- Sin cambios en código fuente

### No aplica en este addon
- **Control flow migration** (`*ngIf` → `@if`): no hay templates propios en este addon
- **Migración `inject()`**: sin inyectores propios complejos — todo el DI va a través de `OntimizeWebModule`
- **Guards funcionales**: sin guards propios
- **Standalone gradual**: no hay componentes que requieran migración parcial — se gestiona en Fase 3

---

## FASE 3: Angular 17 → 18 — Rama `migration/18.x.x` ✅ COMPLETADO

### Acciones realizadas
- Actualizar todas las dependencias Angular a `^18.2.0`
- `ng-packagr` → `^18.2.0`, `typescript` → `~5.5.4`
- Añadir `luxon ^3.4.0` + `@types/luxon` (peer de `ngx-material-timepicker` transitivo del framework)
- Eliminar `@angular/flex-layout` y `@ngbracket/ngx-layout`
- Eliminar `FlexLayoutModule` de `o-components.ts` (import y array `OEXTRACOMPONENTS_IMPORTS_MODULES`)
- `ontimize-web-ngx` → `file:../ontimize-web-ngx/dist/ontimize-web-ngx-18.0.0-SNAPSHOT-0.tgz`
- Actualizar `peerDependencies` a `ontimize-web-ngx ^18.0.0`

### Standalone migration ⏳ PENDIENTE

El framework `ontimize-web-ngx@18` ya tiene **201 componentes con `standalone: true`** en su rama `migration/18.x.x`. Los componentes de este addon aún no están migrados.

**Inventario de componentes a migrar:**
| Componente / Directiva | Archivo |
|---|---|
| `OImageEditorComponent` | `o-image-editor/o-image-editor.component.ts` |
| `ODataViewComponent` | `o-data-view/o-data-view.component.ts` |
| `OSkeletonComponent` | `o-skeleton/o-skeleton.component.ts` |
| `ODataViewTableColumnsDirective` | `directives/o-data-view-table-columns.directive.ts` |
| `ODataViewGridItemDirective` | `directives/o-data-view-grid-item.directive.ts` |

**Módulos wrapper a mantener por backward compatibility:**
- `OntimizeWebNgxExtraComponentsModule` → re-exportar standalone components
- `OImageEditorModule`, `ODataViewModule` → mantener como wrappers deprecated

**Pasos:**
1. Añadir `standalone: true` a cada componente/directiva
2. Mover sus `imports` de NgModule al array `imports` del decorador `@Component`
3. Mantener los NgModule wrapper re-exportando los standalone components
4. Verificar build y consumo desde playground

**Bloqueo**: Esperar a que el framework publique la API standalone completa para alinear la migración de este addon con la del framework.

### No aplica en este addon
- **M3 theming migration**: sin archivos SCSS de theming propios — el theming lo gestiona `ontimize-web-ngx`
- **Typed Forms**: sin uso de `UntypedFormGroup`/`UntypedFormControl` propios
- **Guards funcionales**: sin guards propios

---

## Verificación por fase

1. `npm run build` — debe compilar sin errores
2. Verificar que los componentes exportados son consumibles desde un proyecto Angular de la versión target

---

## Decisiones

- **flex-layout**: Mantenido `@angular/flex-layout` como peer transitorio en Fases 1-2 (requerido por `ontimize-web-ngx@15`); eliminado en Fase 3 ✅
- **ontimize-web-ngx**: Usada `^15.9.0` en Fases 1-2; en Fase 3 apunta al tgz local `^18.0.0` ✅
- **ngx-image-cropper**: Migrado a standalone en Fase 1 (`ImageCropperModule` → `ImageCropperComponent`) ✅
- **luxon**: Añadido en Fase 3 como dependencia directa (peer transitivo de `ngx-material-timepicker` que viene del framework) ✅
- **Standalone**: Pendiente ⏳ — 5 componentes/directivas a migrar (ver Fase 3). Bloqueado hasta que el framework publique su API standalone completa
- **M3 theming**: Sin theming propio — depende del framework; se actualizará cuando `ontimize-web-ngx` publique su nueva API de theming
- **Control flow / inject() / Guards**: No aplica — addon sin templates propios ni guards ni DI complejo propio
