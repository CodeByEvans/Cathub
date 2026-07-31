# Cathub — Agent Context

Monorepo: `app/` (Tauri + React 19 + Vite + Tailwind 4) y `web/` (API Node/Express). Frontend en español (UI y copy).

## Design Context

- **PRODUCT.md** (raíz del repo) — registro `product`, usuarios (parejas), personalidad (juguetón, íntimo, presente), anti-referencias, principios de diseño, accesibilidad (WCAG 2.1 AA).
- **DESIGN.md** (raíz del repo) — sistema visual: tokens OKLCH (Yarn Blue, neutros azulados, parchment de notas), tipografía (Nunito/Geist Mono/Caveat), elevación (plano + glow de estado), componentes y reglas nombradas (Yarn Ball, Flat-By-Default, Glow Means Alive…).
- `app/.impeccable/` — sidecar `design.json` y config de `$impeccable live`.

Toda tarea de UI debe leer PRODUCT.md + DESIGN.md antes de escribir código. Verificación del frontend: `cd app && npm run build` (tsc + vite).
