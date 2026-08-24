import { motion, AnimatePresence } from "framer-motion";
import { Power } from "lucide-react";
import { Button } from "@/shared/components/atoms/button";

interface QuitConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function QuitConfirmModal({
  open,
  onCancel,
  onConfirm,
}: QuitConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-6 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          <motion.div
            className="relative w-[320px] rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-3 flex flex-col items-center text-center glass:bg-transparent"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 ring-2 ring-primary/30 flex items-center justify-center mb-2.5">
              <Power className="w-4.5 h-4.5 text-primary" />
            </div>

            <h2 className="text-sm font-semibold text-foreground leading-snug">
              ¿Seguro que quieres salir de Cathub?
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Cerrarás la app por completo. Podrás volver a abrirla desde su
              icono.
            </p>

            <div className="mt-4 flex w-full gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 rounded-full"
                onClick={onConfirm}
              >
                Salir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
