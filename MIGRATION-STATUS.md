# Migración Angular 15 → 18 — Estado actual — ontimize-web-ngx-extra-components

> Última actualización: 29 abril 2026 (fixes post-migración o-image-editor, deps alineadas, changelog 18.0.0-next.0)

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
| Fase 4: Standalone components | ✅ Completado | `8b294f4` |
| Fase 5: Adopción framework M3 | ✅ Completado | `9f83a96` |
| Fase 6: Fixes post-migración + deps | ✅ Completado | `187f32d` → `510df53` |

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

### Fase 5: Adopción del framework M3 — commit `9f83a96` (21 abril 2026)

**Rama**: `migration/18.x.x`

Tras la migración Material M2→M3 del framework (rama `theming/m3`,
commits `fdcb42da` → `ee7f3534`), el addon se actualizó para consumir
el nuevo tgz y adoptar los tokens runtime `--o-*`.

#### Cambios

| Fichero | Cambio |
|---|---|
| `projects/ontimize-web-ngx-extra-components/src/lib/components/o-image-editor/o-image-editor.component.scss` | Color hardcoded `#1464A5` sustituido por `var(--o-primary-500)` y `var(--o-primary-contrast-500)` en la regla `.tools-toggle .mat-button-toggle.mat-button-toggle-checked`. Ahora el componente sigue el color primary del tema activo (light/dark). |
| `projects/app-test/src/styles.scss` | Import actualizado de `themes/ontimize.scss` (legacy eliminado en Fase 1 del framework M3) a `themes/oxygen.scss`. |
| `projects/ontimize-web-ngx-extra-components/src/lib/components/o-skeleton/o-skeleton.component.spec.ts` | `OSkeletonComponent` movido de `declarations` a `imports` (era standalone pero TestBed lo rechazaba). |
| `package-lock.json` | Regenerado al reinstalar `ontimize-web-ngx-18.0.0-SNAPSHOT-0.tgz` del framework (rama `theming/m3`). |

#### Validación

- `npx ng build ontimize-web-ngx-extra-components`: ✅ 0 errores.
- `npx ng test --watch=false`: ✅ `TOTAL: 5 SUCCESS + 1 SUCCESS`, 0 fallos.

#### Notas

- El resto de SCSS del addon (`o-data-view.component.scss`, `o-skeleton.component.scss`) no necesitó cambios — no usaban APIs M2 ni tenían colores hardcoded.
- El addon queda listo para ser re-empaquetado (`npm pack` desde `dist/`) y consumido por la playground con el framework M3.

---

### Fase 6: Fixes post-migración + deps — commits `187f32d` → `510df53` (29 abril 2026)

**Rama**: `migration/18.x.x`

#### Templates

| Commit | Fichero | Cambio |
|--------|---------|--------|
| `187f32d` | `o-image-editor.component.html` | Migrar 23 directivas flex-layout → clases `o-flex-*` + inline styles; `*ngIf`/`*ngFor` → `@if`/`@for` |
| `187f32d` | `o-data-view.component.html` | `*ngIf`/`*ngFor` → `@if`/`@for` |

#### o-image-editor layout fixes

| Commit | Cambio |
|--------|--------|
| `a3d0e61` | `.tools-toggle.mat-button-toggle-group`: `flex-direction:column` con doble selector para ganar especificidad sobre Material |
| `4dc33af` | `.tools-toggle`: `border-radius:0`; ocultar `.mat-pseudo-checkbox` |
| `510df53` | `alignImage="center"` en `image-cropper` — overlay y cropper comparten el mismo `margin-left`; `flex:1 1 0` + `min-height:0` para respetar altura del padre; `box-sizing:border-box` en `.o-image-editor` para que `padding:32px` no cause overflow |

#### app-test

| Commit | Cambio |
|--------|--------|
| `4a77c0d` | `index.html`: Material Icons → Material Symbols Outlined; `styles.scss`: añadir `.o-dark` mixin; `app.module.ts`: eliminar `OntimizeWebModule` duplicado |

#### Dependencias

| Commit | Cambio |
|--------|--------|
| `89d5ff1` | `@angular-eslint/*`: `^18.0.0` → `18.4.3`; `@typescript-eslint`: `^5.43.0` → `^7.0.0`; `eslint`: `^8.28.0` → `^8.56.0`; `@types/node`: `^12` → `^18`; `jasmine-core`: `~4.5` → `~5.1`; `ts-node`: `~7.0` → `~10.9`; `ngx-extended-pdf-viewer`: `^19.0.0` → `^20.0.0` (soporte Angular 18) |
| `4bbadc8` (CI) | Build CI actualizado |

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
