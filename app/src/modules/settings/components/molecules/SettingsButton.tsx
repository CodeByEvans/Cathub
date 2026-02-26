import { Button } from "@/globals/components/atoms/button";
import React from "react";
import { SettingsButtonProps } from "../../@types/settings.types";

interface Props extends SettingsButtonProps {
  onClickAction: () => void;
}

export const SettingsButton: React.FC<Props> = ({
  variant,
  buttonClasses,
  onClickAction,
  icon,
  text,
  textClasses,
}) => (
  <Button
    variant={variant}
    className={`h-full flex-1 flex flex-col items-center justify-center border-2 ${buttonClasses}`}
    onClick={onClickAction}
  >
    {icon}
    <span
      className={
        textClasses
          ? textClasses
          : "text-sm text-foreground text-center leading-tight"
      }
    >
      {text}
    </span>
  </Button>
);
