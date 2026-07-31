---
name: Cathub
description: Widget de escritorio para parejas — notas, llamadas y presencia en un gato que habita la pantalla
colors:
  yarn-blue: "oklch(0.55 0.12 240)"
  yarn-blue-hover: "oklch(0.55 0.12 240 / 0.9)"
  snow: "oklch(0.98 0 0)"
  cool-paper: "oklch(0.97 0.005 240)"
  card-light: "oklch(0.99 0.003 240)"
  ink: "oklch(0.2 0.02 240)"
  fog-gray: "oklch(0.5 0.02 240)"
  mist: "oklch(0.94 0.01 240)"
  dust: "oklch(0.93 0.008 240)"
  wash: "oklch(0.88 0.04 240)"
  hairline: "oklch(0.88 0.015 240)"
  brick: "oklch(0.577 0.245 27.325)"
  leaf: "oklch(0.58 0.15 160)"
  pebble: "oklch(0.55 0.02 240)"
  parchment: "#fdf9f0"
  parchment-edge: "#e8dcc8"
  parchment-ink: "oklch(0.25 0.02 70)"
typography:
  title:
    fontFamily: "Nunito, Geist, Geist Fallback, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Nunito, Geist, Geist Fallback, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, Geist Mono Fallback, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.2
  note-hand:
    fontFamily: "Caveat, cursive"
    fontSize: "22.4px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.yarn-blue}"
    textColor: "{colors.snow}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.yarn-blue-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fog-gray}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.brick}"
    textColor: "{colors.snow}"
    rounded: "{rounded.full}"
    padding: "10px"
    height: "40px"
    width: "40px"
  input-pill:
    backgroundColor: "oklch(0.94 0.008 240 / 0.5)"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    height: "32px"
  bubble-self:
    backgroundColor: "{colors.yarn-blue}"
    textColor: "{colors.snow}"
    rounded: "{rounded.2xl}"
    padding: "6px 12px"
  bubble-partner:
    backgroundColor: "oklch(0.94 0.01 240 / 0.8)"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "6px 12px"
  badge-unread:
    backgroundColor: "{colors.yarn-blue}"
    textColor: "{colors.snow}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  surface-widget:
    backgroundColor: "oklch(0.99 0.003 240 / 0.95)"
    rounded: "{rounded.2xl}"
---

# Design System: Cathub

## 1. Overview

**Creative North Star: "The Desktop Familiar"**

Un gato que habita el escritorio y vela por el vínculo de dos personas. Todo el sistema gira alrededor de esa metáfora: la ventana es pequeña porque el familiar no ocupa casa, la acompaña; los elementos están vivos porque un familiar respira (ojos que siguen el ratón, colita que se mueve, puntos de "escribiendo…"); y la estética es suave y redonda porque el contacto es cotidiano, íntimo, sin aristas.

El sistema rechaza por completo tres familias: el chrome de chat corporativo (Slack/Discord), la dinámica social de feeds y dating apps, y el dashboard de sistema con datos que gritan. Cathub presume de vínculo, no de datos. La interfaz se toca durante segundos: todo estado debe leerse de un vistazo a 700×200 píxeles.

**Key Characteristics:**
- Superficies planas y claras; la vida llega por movimiento y glow, no por decoración.
- Un solo acento (Azul Bola de Pelo) con papel de atención; el resto es una escala de grises azulados frescos.
- Componentes táctiles, redondos, vivos: pill inputs, burbujas con cola de chat, botones circulares con springs.
- Excepción narrativa: las notas son papel (parchment + Caveat) — el único lugar donde el sistema cambia de piel.
- Tres temas hermanos (light, dark, glass) sobre los mismos tokens OKLCH.

## 2. Colors

La paleta es una habitación tranquila con un juguete azul: neutros azulados frios de baja croma y un solo acento saturado hue-240 que marca dónde está el juego.

### Primary
- **Azul Bola de Pelo / Yarn Blue** (oklch(0.55 0.12 240); dark oklch(0.65 0.1 240)): acción principal, estado activo (send habilitado, badge de no leídos, marca de audio), glow de elementos vivos y la clase `bg-primary` en burbujas propias. Es el juguete del gato: aparece donde se espera respuesta.

### Neutral
- **Papel Frío / Cool Paper** (oklch(0.97 0.005 240)): fondo de la ventana widget en claro.
- **Carta / Card Light** (oklch(0.99 0.003 240)): superficie elevada de paneles y overlays.
- **Tinta / Ink** (oklch(0.2 0.02 240)): texto principal y títulos.
- **Gris Niebla / Fog Gray** (oklch(0.5 0.02 240)): texto secundario, placeholders (subir opacidad si el contraste baja de 4.5:1).
- **Bruma / Mist** (oklch(0.94 0.01 240)): burbujas del partner, fondos `secondary`.
- **Lavanda de Acento / Wash** (oklch(0.88 0.04 240)): hover de ghost buttons y superficies activas suaves.
- **Hilo / Hairline** (oklch(0.88 0.015 240)): separadores y bordes de 1px; nunca lleva peso visual.

### State
- **Verde En Línea / Leaf** (oklch(0.58 0.15 160)): punto de presencia online. Siempre acompañado de forma (dot), nunca solo color.
- **Rojo Ladrillo / Brick** (oklch(0.577 0.245 27.325)): colgar, mute activo, errores. El único rojo del sistema.

### Note parchment (excepción)
- **Pergamino / Parchment** (#fdf9f0, borde #e8dcc8, tinta oklch(0.25 0.02 70)): la piel de papel de las notas compartidas. Cálida a propósito: es el recuerdo físico dentro de la ventana digital.

### Named Rules
**The Yarn Ball Rule.** El acento aparece ≤10% de cualquier pantalla, siempre con función (acción, activo, marca de estado). Si el primary cubre más superficie "porque queda bonito", está mal usado: su rareza es su voz.

**The Whisker Grayscale Rule.** Los neutros son azulados (hue 240, croma ≤0.02). El gris cálido está prohibido fuera de las notas de papel; ahí, y solo ahí, vive el marrón.

## 3. Typography

**Body/Display Font:** Nunito (con Geist como fallback)
**Label/Mono Font:** Geist Mono (datos, timestamps, timers)
**Hand Font:** Caveat (solo papel de notas)

**Character:** una sola familia cálida y redonda lo lleva casi todo; la personalidad sale de peso y tamaño, no de pairing. La mono marca los datos vivos (duración de llamada, horas); Caveat es la voz de papel, reservada al recuerdo.

### Hierarchy
- **Title** (600, 14px, lh 1.2): nombre del partner, títulos de vista. En widget no hay display grande: la escala es de vistazo.
- **Body** (400–500, 12px, lh 1.5): mensajes, opciones, copy general. Medida corta obligada por el ancho del widget (~440px de strip).
- **Label** (500, 9–10px, tabular-nums): timestamps inline, timer de llamada, contadores `/200`. Siempre mono para que el timer no baile.
- **Note Hand** (500, 22.4px, lh 1.5): contenido de notas en Caveat; centrado en el papel.

### Named Rules
**The One Family Rule.** Nunito lleva todo el chrome. Prohibido introducir display serifs o sans técnicas en labels de UI: la voz se construye con peso (400/500/600), no con familias nuevas.

**The Paper Voice Rule.** Caveat existe únicamente dentro del papel de notas. Fuera de `--note-*` está prohibida; un timestamp en Caveat es un bug, no un detalle.

## 4. Elevation

Plano por defecto: las superficies no llevan sombra en reposo (salvo el marco de la ventana widget y overlays tipo popover/toast, que usan la sombra de superficie del sistema). La profundidad se comunica con tono (card sobre popover sobre background) y con bordes `hairline` al 30–50%.

### Glow Vocabulary (la excepción viva)
- **Glow de estado primary** (`box-shadow: 0 2px 12px hsl(var(--primary) / 0.25)`): solo sobre elementos vivos en Yarn Blue: burbuja propia, badge de no leídos, botón send activo.
- **Aura de logo** (`drop-shadow(0 0 12px hsl(var(--primary) / 0.6))`): el familiar respira; solo el logo.
- **Focus ring** (`ring-2 ring-primary/15` o `ring-[3px] ring-ring/50`): teclado y foco de inputs; siempre visible, nunca decorativo.

### Named Rules
**The Flat-By-Default Rule.** Cards, chips y burbujas no llevan sombra en reposo. Si una card necesita sombra para "destacar", lo que falla es la jerarquía, no la sombra.

**The Glow Means Alive Rule.** El glow primary solo vive en cosas que responden o cambian (un mensaje, un botón habilitado, el logo). Glow estático sobre un card es ruido prohibido.

## 5. Components

### Buttons
- **Shape:** rectángulo redondeado generoso (10px radius) para acciones de texto; círculo completo (`rounded-full`) para acciones de icono.
- **Primary:** Yarn Blue con texto Snow, altura 36px; hover a 90% de opacidad del mismo azul — no se aclara, no cambia de familia.
- **Ghost:** transparente con texto fog-gray; hover con lavanda suave (wash al 40–60%).
- **Destructive circular (colgar):** Brick a círculo completo 40px con sombra de superficie; es el único botón con sombra en reposo (es un artefacto físico: el botón rojo del teléfono).
- **Feedback:** `whileHover 1.08 / whileTap 0.9` en acciones rápidas; springs 380/26. Todo botón tiene hover, focus-visible ring y disabled a 50%/30% de opacidad.

### Inputs / Fields
- **Pill de chat:** cápsula completa con fondo input al 50%, borde hairline; al foco, borde primary/50 + ring primary/15. El contador de caracteres solo aparece al acercarse al límite (>160/200), en mono 9px.
- **Input clásico (atom):** borde hairline, fondo transparente, radius md, ring `ring-ring/50` + `ring-[3px]` al foco.

### Message Bubbles (chat de llamada)
- **Propias:** Yarn Blue, texto Snow, glow de estado, cola `rounded-br-sm` en 2xl.
- **Partner:** Mist al 80% + borde hairline/40, cola `rounded-bl-sm`; sin glow.
- **Timestamp:** inline dentro de la burbuja, mono 9px al 60% del mismo color de texto; prohibido como etiqueta suelta debajo.
- **Entrada:** spring direccional (propias desde la derecha, partner desde la izquierda), 380/26, y:8 + scale:0.95.

### Badge de no-leídos
- Yarn Blue a cápsula completa, padding 2–8px, ring exterior color-mix 30% primary; pop con scale spring al aparecer.

### Toasts
- Popover al 95% con backdrop-blur, borde de estado al 30% (success/error/info/warning), icono 16px, top-right con entrada spring 400/30. Duración 3s por defecto.

### Controles de llamada
- Círculos 36px con borde 2px: reposo en `border-border/50 bg-secondary/50` con hover hacia primary/40; activos mute/ensordecer pasan a Brick al 50%/10% (icono + borde, no relleno sólido).
- Colgar: ver Buttons/destructive circular.

### Ventana widget (marco)
- `surface-widget` (card al 95% + backdrop-blur-xl; en glass, transparente con blur mínimo), radius 16px, borde hairline/40, sombra de superficie del sistema. La ventana ES un componente: su marco nunca se improvisa.

### Signature: el Familiar
- Logo gato SVG (o badge círculo negro + borde blanco en el splash y en ausencia de avatar) con ojos que siguen el ratón y párpados que parpadean; punto de presencia Leaf con borde de fondo; colita "〜" beta wag 0.9s en flujo de llamada. Es información viva, no decoración: online, hablando, escribiendo.

## 6. Do's and Don'ts

### Do:
- **Do** usar Yarn Blue solo donde se espera respuesta del usuario (acción, activo, no leído) — The Yarn Ball Rule.
- **Do** comunicar estado con movimiento (springs, máscaras, puntos de typing) además de color; reduced-motion se respeta con crossfade.
- **Do** mantener timestamps y timers en Geist Mono tabular-nums para que nada "baile" al cambiar dígitos.
- **Do** dar a las notas su piel de papel completa (parchment, borde, pliegue, Caveat) o no usar papel en absoluto.
- **Do** respetar las tres pieles (light/dark/glass) tocando tokens, nunca hardcodeando hex en componentes.

### Don't:
- **Don't** introducir chrome de herramienta corporativa: canales, threads, sidebars de servidor, tablas. PRODUCT.md lo prohíbe por nombre (Slack, Discord, Teams).
- **Don't** usar sombras en cards en reposo ni border+shadow anchos a la vez: "ghost-card" prohibida (The Flat-By-Default Rule).
- **Don't** poner glow estático sobre superficies inertes (The Glow Means Alive Rule).
- **Don't** usar Caveat fuera del papel de notas (The Paper Voice Rule).
- **Don't** meter feeds, perfiles, métricas sociales ni estética de dating app: Cathub es un vínculo de dos, no una red.
- **Don't** comunicar presencia o estado solo con color: siempre forma (dot), icono o texto acompañando (WCAG 2.1 AA).
- **Don't** crear eyebrow en mayúsculas trackadas, texto con gradiente ni grid decorativos: no son vocabulario Cathub.
