import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import CathubLogoAuth from "./logo-auth";
import CathubLogoWidget from "./logo-widget";

interface CathubLogoPrimaryProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  auth?: boolean;
}

export function CathubLogo({
  size = "md",
  className,
  auth,
}: CathubLogoPrimaryProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <motion.div
      className={cn(
        "rounded-full bg-black border-2 border-white/80",
        sizeClasses[size],
        className,
      )}
      style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))" }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      {auth ? (
        <CathubLogoAuth width="100%" height="100%" />
      ) : (
        <CathubLogoWidget width="100%" height="100%" />
      )}
    </motion.div>
  );
}
