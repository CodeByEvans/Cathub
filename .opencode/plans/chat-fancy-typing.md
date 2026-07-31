# Plan — Chat fancy (Personalidad Cathub) + estado "escribiendo…"

Surface: strip de chat ~440×190px dentro del widget de llamada (700×200).
Sistema: tokens OKLCH existentes, Nunito/Geist Mono, vocabulario glow primary + springs framer-motion.
Decisión: personalidad Cathub completa + protocolo typing completo. Registro: product (transiciones 150–300ms).
Nota: `npx impeccable update` falló (resuelve a paquete npm ajeno; el skill no tiene updater instalable). Ofrecer `$impeccable init` al final para capturar PRODUCT.md.

## 1. Protocolo typing (PeerJS data channel)

**CallEventBus.ts**
- + `onPartnerTypingCb: ((typing: boolean) => void) | null`
- + `onPartnerTyping(cb)` / `emitPartnerTyping(typing: boolean)`

**CallManager.ts**
- `sendStatus` union → `"__MUTE__" | "__DEAF__" | "__TYPING__"`
- + `sendTypingStatus(isTyping: boolean) { this.sendStatus("__TYPING__", isTyping); }`
- `handleDataMessage`: rama `__TYPING__:` → `emitPartnerTyping(p === "true")`; antes de `emitChatMessage` → `emitPartnerTyping(false)` (mensaje real limpia indicador)

**ICallActions.ts**
- + `sendTypingStatus(isTyping: boolean): void;`

## 2. Estado en contexto

**CallContext.tsx**
- estado `partnerTyping: boolean`
- suscripción `service.events.onPartnerTyping(setPartnerTyping)` + **timeout de seguridad 5s** (auto-clear si se pierde el `false`; clearTimeout al recibir nuevo valor)
- `onCallEnded` → `setPartnerTyping(false)`
- `callActions.sendTypingStatus = (t) => module.calls.sendTypingStatus(t)`
- value: + `partnerTyping`

**useChat.ts**
- return `{ messages, sendChatMessage, partnerTyping, sendTypingStatus }` (desde useCall: `partnerTyping`, `calls.sendTypingStatus`)

## 3. ChatMessage.tsx — burbuja con vida

- Wrapper `motion.div` por mensaje: `initial={{ opacity: 0, y: 8, scale: 0.95, x: isMe ? 6 : -6 }}` → `animate spring { stiffness: 380, damping: 26 }`
- Mía: `bg-primary text-primary-foreground` + `shadow-[0_2px_12px_hsl(var(--primary)/0.25)]`; `rounded-2xl rounded-br-sm`
- Partner: `bg-secondary/80 border border-border/40`; `rounded-2xl rounded-bl-sm`
- Timestamp **inline** al final de la burbuja: `text-[9px] font-mono tabular-nums opacity-60 ml-1.5 self-end` (elimina etiqueta suelta)

## 4. ChatMessageList.tsx

- Mask fade superior: `style={{ maskImage: "linear-gradient(to bottom, transparent 0, black 16px)" }}` (también WebkitMaskImage)
- Empty state: `CathubLogoWidget size="sm"` + copy "Todavía no hay mensajes… di miau 🐾" + hint "Enter para enviar" (text-[10px] muted, centrado, motion fade-in)
- `TypingIndicator` slot antes del `bottomRef` (AnimatePresence)
- Conservado: separador "nuevos", scrollIntoView smooth

## 5. TypingIndicator (nuevo, en ChatMessageList o archivo propio en chat/components)

- Burbuja forma partner (`bg-secondary/80 border border-border/40 rounded-2xl rounded-bl-sm px-3 py-2`)
- 3 puntos `w-1.5 h-1.5 rounded-full bg-muted-foreground/70` con bounce escalonado (motion `animate={{ y: [0,-3,0] }}` transition repeat Infinity, delay 0/0.15/0.3, duration 0.9; reduced-motion → opacity pulse)
- `role="status" aria-label="{partnerName} está escribiendo"`
- Entrada/exit con AnimatePresence (scale 0.8→1 spring rápido)

## 6. ChatInput.tsx — pill con estados

- Contenedor: `rounded-full bg-input/50 border border-border/50 px-3 py-1 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition`
- Botón send: `motion.button` whileHover 1.08 / whileTap 0.9; con texto: `bg-primary text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.35)]`; vacío: ghost muted disabled (AnimatePresence entre estados, icono Send igual)
- Contador: solo `value.length > 160` → `text-[9px] font-mono text-muted-foreground` (`{n}/200`)
- Typing: `onChange` → si value.length>0: `onTypingChange(true)` + reinicia timer 2s → `onTypingChange(false)`; `handleSend` → `onTypingChange(false)` inmediato; cleanup timer en unmount
- Prop nueva: `onTypingChange?: (typing: boolean) => void`

## 7. ChatSection.tsx + InCallScreen.tsx

- ChatSection props: + `partnerTyping?: boolean`, + `onTypingChange?: (t: boolean) => void`; pasa a ChatMessageList (partnerTyping) y ChatInput (onTypingChange)
- InCallScreen: `const { messages, sendChatMessage, partnerTyping, sendTypingStatus } = useChat();` y los pasa a ChatSection
- InCallScreen: envolver vista completa con `<MotionConfig reducedMotion="user">`

## Orden de ejecución

1. CallEventBus → CallManager → ICallActions
2. CallContext → useChat
3. TypingIndicator → ChatMessage → ChatMessageList → ChatInput → ChatSection → InCallScreen
4. `npx tsc --noEmit` + `npm run build`

## Verificación

- tsc + vite build
- `npm run tauri dev` → `simulateInCall`: burbujas entran con spring direccional, empty state gatuno, pill con focus ring, send button se activa con glow, contador >160
- Typing: revisión de código (canal PeerJS requiere dos instancias para E2E); auto-clear por mensaje y timeout 5s cubiertos por diseño
