import { Button } from "@/globals/components/atoms/button";
import React from "react";
import { SettingsButtonProps } from "../../@types/settings.types";

interface Props extends SettingsButtonProps {
  onClickAction: () => void;
}

export const SettingsButton: React.FC<Props> = ({
  buttonClasses,
  onClickAction,
  icon,
  text,
  textClasses,
}) => (
  <Button
    variant="outline"
    className={`h-full flex-1 flex flex-col items-center justify-center border-2 border-primary ring-2 ring-primary/20 ${buttonClasses ? buttonClasses : "bg-muted-foreground/5 dark:bg-muted-foreground/10 hover:scale-[1.02] border-border/50 hover:border-primary/50 transition-all  duration-300"}`}
    onClick={onClickAction}
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
