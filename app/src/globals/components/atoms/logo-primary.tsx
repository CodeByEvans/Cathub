import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CathubLogoPrimaryProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  mode?: "login" | "register";
}

export function CathubLogoPrimary({
  size = "md",
  className,
  mode,
}: CathubLogoPrimaryProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      className={cn("rounded-full", sizeClasses[size], className)}
      style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))" }}
      animate={{
        rotateY: mode === "register" ? 180 : 0,
        scale: mode === "register" ? 1.05 : 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      <img
        src="/logo-primary.svg"
        alt="Cathub Logo"
        className="w-full h-full object-contain bg-primary dark:bg-primary   rounded-full ring-2 ring-black/40 shadow-md"
      />
    </motion.div>
  );
}
