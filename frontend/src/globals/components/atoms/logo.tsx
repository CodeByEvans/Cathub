import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CathubLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  mode?: "login" | "register";
}

export function CathubLogo({ size = "md", className, mode }: CathubLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      className={cn("rounded-full", sizeClasses[size], className)}
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
        src="/logo.svg"
        alt="Cathub Logo"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
}
