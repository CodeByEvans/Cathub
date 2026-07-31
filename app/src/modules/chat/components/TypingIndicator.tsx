import { motion } from "framer-motion";

interface TypingIndicatorProps {
  partnerName: string;
}

export function TypingIndicator({ partnerName }: TypingIndicatorProps) {
  return (
    <motion.div
      className="flex w-full justify-start"
      initial={{ opacity: 0, y: 6, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      role="status"
      aria-label={`${partnerName} está escribiendo`}
    >
      <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-secondary/80 border border-border/40">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
