import { Button } from "@/globals/components/atoms/button";
import React from "react";
import { SettingsButtonProps } from "../../@types/settings.types";
import { audioService } from "@/services/audio.service";

interface Props extends SettingsButtonProps {
  onClickAction: () => void;
}

export const SettingsButton: React.FC<Props> = ({
  buttonClasses,
  onClickAction,
  icon,
  text,
  textClasses,
}) => {
  const play = (key: string) => audioService.play(key, { volume: 0.1 });

  return (
    <Button
      variant="outline"
      className={`h-full flex-1 flex flex-col items-center justify-center border-2 border-primary ring-2 ring-primary/20 ${buttonClasses ? buttonClasses : "bg-muted-foreground/5 dark:bg-muted-foreground/10 hover:scale-[1.02] border-border/50 hover:border-primary/50 transition-all  duration-300"}`}
      onClick={() => {
        onClickAction();
        play("click");
      }}
      onMouseEnter={() => play("hover")}
    >
      <div className="text-white dark:text-foreground glass:text-white">
        {icon}
      </div>
      <span
        className={
          textClasses
            ? textClasses
            : "text-sm  text-white e  text-center leading-tight "
        }
      >
        {text}
      </span>
    </Button>
  );
};
