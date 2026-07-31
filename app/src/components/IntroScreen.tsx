import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";

interface Props {
  onExitStart: () => void;
  onDone: () => void;
}

// Timings del splash (ajustables)
const REVEAL_DURATION = 1.1; // appear: derecha → izquierda
const HOLD_DURATION = 0.15; // pausa con el icono completo
const EXIT_DURATION = 0.7; // disappear: derecha → izquierda
const SOFT_BAND = 30; // ancho del borde difuminado (% del icono)

export function IntroScreen({ onExitStart, onDone }: Props) {
  const callbacksRef = useRef({ onExitStart, onDone });
  callbacksRef.current = { onExitStart, onDone };

  // p: progreso del reveal (0 = oculto, 1 = visible). q: progreso del exit (0 = visible, 1 = oculto).
  const p = useMotionValue(0);
  const q = useMotionValue(0);
  const [phase, setPhase] = useState<"reveal" | "exit">("reveal");

  // Reveal: la banda negra (visible) crece desde la derecha del icono
  const revealStart = useTransform(p, (v) => v * (100 + SOFT_BAND) - SOFT_BAND);
  const revealEnd = useTransform(p, (v) => v * (100 + SOFT_BAND));
  const revealMask = useMotionTemplate`linear-gradient(to left, black ${revealStart}%, transparent ${revealEnd}%)`;

  // Exit: la banda transparente (oculta) crece también desde la derecha (R→L)
  const exitStart = useTransform(q, (v) => v * (100 + SOFT_BAND) - SOFT_BAND);
  const exitEnd = useTransform(q, (v) => v * (100 + SOFT_BAND));
  const exitMask = useMotionTemplate`linear-gradient(to left, transparent ${exitStart}%, black ${exitEnd}%)`;

  // Al cambiar de fase q aún es 0 → máscara totalmente visible (continuidad)
  const maskImage = phase === "reveal" ? revealMask : exitMask;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const controls: { stop: () => void }[] = [];

    controls.push(
      animate(p, 1, {
        duration: REVEAL_DURATION,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          timers.push(
            setTimeout(() => {
              callbacksRef.current.onExitStart();
              setPhase("exit");
              controls.push(
                animate(q, 1, {
                  duration: EXIT_DURATION,
                  ease: "easeIn",
                  onComplete: () => callbacksRef.current.onDone(),
                }),
              );
            }, HOLD_DURATION * 1000),
          );
        },
      }),
    );

    return () => {
      controls.forEach((c) => c.stop());
      timers.forEach(clearTimeout);
    };
  }, [p, q]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#080808] flex items-center justify-center rounded-xl">
      <motion.div
        className="rounded-full bg-black border-2 border-white/80 w-16 h-16"
        style={{ WebkitMaskImage: maskImage, maskImage }}
      >
        <img
          src="/logo.svg"
          alt="Cathub"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
}
