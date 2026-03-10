import { Button } from "@/globals/components/atoms/button";
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
}: OptionCardProps<T>) => {
  const play = (key: SoundKey) => audioService.play(key, { volume: 0.1 });
  return (
    <Button
      variant="outline"
      onClick={() => {
        onClick?.(value);
        play("click");
      }}
      onMouseEnter={() => play("hover")}
      className={cn(
        // layout
        "flex-1 h-full px-3 py-4",
        "flex flex-col items-center justify-center gap-2",
        "rounded-xl border-2",

        // animation
        "transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",

        // base colors
        "bg-muted-foreground/5 dark:bg-muted-foreground/10 ",

        // active vs inactive
        isActive
          ? [
              "border-primary",
              "ring-2 ring-primary/30",
              "bg-primary/10",
              "text-primary",
              "scale-[1.02]",
            ]
          : [
              "border-border",
              "text-muted-foreground",
              "hover:border-primary/50",
              "hover:text-foreground",
            ],

        className,
      )}
    >
      <div
        className={cn(
          "transition-colors duration-300  ",
          isActive ? "text-accent text-shadow-md " : "text-muted-foreground",
        )}
      >
        {icon}
      </div>

      <div className="text-center leading-tight">
        <div className="text-sm font-semibold text-foreground glass:text-white">
          {title}
        </div>

        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </Button>
  );
};
