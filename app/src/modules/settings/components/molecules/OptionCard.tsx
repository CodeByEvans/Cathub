import { Button } from "@/globals/components/atoms/button";
import { cn } from "@/lib/utils";
import { OptionCardProps } from "../../@types/settings.types";

export const OptionCard = <T,>({
  icon,
  title,
  description,
  isActive = false,
  value,
  onClick,
  className,
}: OptionCardProps<T>) => {
  return (
    <Button
      variant="outline"
      onClick={() => onClick?.(value)}
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
          isActive ? "text-accent " : "text-muted-foreground",
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
