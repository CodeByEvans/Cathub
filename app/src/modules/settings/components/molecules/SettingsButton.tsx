import React from "react";
import { motion } from "framer-motion";
import { SettingsButtonProps } from "../../@types/settings.types";
import { audioService } from "@/services/audio.service";
import { SoundKey } from "@/constants/sounds.constants";

interface Props extends SettingsButtonProps {
  onClickAction: () => void;
  index?: number;
}

export const SettingsButton: React.FC<Props> = ({
  onClickAction,
  icon,
  text,
  index = 0,
}) => {
  const play = (key: SoundKey) => audioService.play(key, { volume: 0.1 });

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        onClickAction();
        play("click");
      }}
      onMouseEnter={() => play("hover")}
      className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border border-border/50 bg-white/5 dark:bg-white/[0.03] backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-colors duration-200"
    >
      <div className="text-foreground dark:text-foreground glass:text-white opacity-80 group-hover:opacity-100">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground dark:text-foreground glass:text-white text-center leading-tight px-1">
        {text}
      </span>
    </motion.button>
  );
};
