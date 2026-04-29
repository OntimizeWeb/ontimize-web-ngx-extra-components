## 18.0.0-next.0 (2026-04-29)

### Features
* **migration**: migrate to Angular 18 — standalone components, control flow syntax (`@if`/`@for`/`@switch`), flex-layout removal
* **theming**: adopt Material 3 tokens from `ontimize-web-ngx` 18 — `--o-*` CSS custom properties for colors, backgrounds, typography

### Bug Fixes
* **o-image-editor**: fix `tools-toggle` flex direction — `mat-button-toggle-group` column layout overrides Material specificity
* **o-image-editor**: remove border-radius from `tools-toggle` group
* **o-image-editor**: hide `mat-pseudo-checkbox` inside `tools-toggle`
* **o-image-editor**: anchor `ngx-ic-overlay` to `image-cropper` via `position: relative` to prevent overlay offset
* **o-data-view**: migrate `*ngIf`/`*ngFor` to Angular 17+ control flow syntax
* **app-test**: apply Angular 18 migration guide — Material Symbols Outlined, `.o-dark` dark theme mixin, remove duplicate `OntimizeWebModule` import

### Miscellaneous
* **deps**: align devDependencies with framework — `@angular-eslint` 18.4.3, `@typescript-eslint` ^7, `eslint` ^8.56, `jasmine-core` ~5.1, `ts-node` ~10.9, `@types/node` ^18
* **deps**: bump `ngx-extended-pdf-viewer` to `^20.0.0` for Angular 18 support
