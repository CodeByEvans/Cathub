import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OptionCardProps } from "../../@types/settings.types";
import { audioService } from "@/services/audio.service";
import { SoundKey } from "@/constants/sounds.constants";

export const OptionCard = <T,>({
  icon,
  title,
  description,
  isActive = false,
  value,
  onClick,
  className,
  index = 0,
}: OptionCardProps<T> & { index?: number }) => {
  const play = (key: SoundKey) => audioService.play(key, { volume: 0.1 });

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        onClick?.(value);
        play("click");
      }}
      onMouseEnter={() => play("hover")}
      className={cn(
        "flex-1 h-full px-3 py-3",
        "flex flex-col items-center justify-center gap-1.5",
        "rounded-xl",
        "transition-colors duration-200",

        isActive
          ? [
              "bg-primary/15",
              "border-2 border-primary",
              "shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]",
              "text-primary",
            ]
          : [
              "bg-white/5 dark:bg-white/[0.03]",
              "border border-border/50",
              "text-muted-foreground",
              "hover:bg-primary/5 hover:border-primary/30 hover:text-foreground",
            ],

        className,
      )}
    >
      <div
        className={cn(
          "transition-colors duration-200",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        {icon}
      </div>

      <div className="text-center leading-tight">
        <div className="text-xs font-semibold text-foreground dark:text-foreground glass:text-white">
          {title}
        </div>
        {description && (
          <div className="text-[10px] text-muted-foreground">{description}</div>
        )}
      </div>
    </motion.button>
  );
};
