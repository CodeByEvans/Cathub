# Product

## Register

product

## Users

Parejas (a distancia o no) que quieren sentirse presentes en el día a día del otro. Usan Cathub como widget siempre visible en el escritorio: notas que llegan como papelitos, llamadas de voz con chat, presencia, hora y clima de ambas ciudades. La app vive en segundo plano; se consulta de un vistazo y se toca en segundos, no en minutos.

## Product Purpose

Cathub es un compañero de escritorio para dos personas enlazadas. Existe para sostener la sensación de cercanía cotidiana sin exigir atención: una nota, un "está escribiendo…", una llamada rápida. El éxito es que el usuario sonría al ver el widget y lo deje abierto todo el día, no que pase tiempo dentro de la app.

## Brand Personality

Juguetón, íntimo, presente. Un gato que habita el escritorio de la pareja: sigue el ratón con los ojos, parpadea, mueve la colita, suena cuando llega algo. Cálido sin ser cursi; cercano sin ser invasivo. Voz en español, cercana y ligera.

## Anti-references

- Herramientas de chat corporativo (Slack, Discord, Microsoft Teams): nada de canales, threads, listas interminables ni estética de oficina.
- Dating apps y social apps genéricas: sin feeds, perfiles públicos ni métricas sociales.
- Widgets técnicos de sistema (monitores de CPU, dashboards): Cathub no presume de datos, presume de vínculo.

## Design Principles

1. **Presencia sobre interrupción**: compañero silencioso, no máquina de notificaciones. El widget está, no interrumpe.
2. **La personalidad ES la funcionalidad**: el gato comunica estado (ojos, cola, sonidos). El delight no es decoración: es información.
3. **Intimidad a escala widget**: la ventana es diminuta (~700×200). Cada píxel tiene propósito; jerarquía por contraste y densidad deliberada, no por decoración.
4. **El movimiento cuenta el estado**: springs, máscaras y puntos informan (escribiendo, no leídos, llamada entrante). Motion nunca es teatro: es señal.
5. **Hecho para dos**: una sola conexión, un solo partner. Simplicidad de vínculo como decisión de producto y de UI.

## Accessibility & Inclusion

Objetivo WCAG 2.1 AA: contraste ≥4.5:1 en texto y ≥3:1 en texto grande; `prefers-reduced-motion` respetado vía `MotionConfig reducedMotion="user"`; estados no comunicados solo por color (iconos y texto acompañan); indicadores con `role="status"`/`aria-label` para lectores de pantalla; textos cortos y directos adecuados a micro-superficies.
