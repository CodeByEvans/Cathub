import { cn } from "@/lib/utils";

interface PawTrailProps {
  count?: number;
  /** Tailwind size class for each paw, e.g. "w-7 h-7" */
  size?: string;
  className?: string;
}

const PAW_DELAYS = [0, 0.18, 0.36, 0.54, 0.72];
const PAW_ROTATIONS = [-15, 10, -10, 12, -8];

function PawPrint({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Toe beans */}
      <ellipse cx="8" cy="9" rx="3.2" ry="4" />
      <ellipse cx="16" cy="6" rx="3.2" ry="4" />
      <ellipse cx="24" cy="9" rx="3.2" ry="4" />
      <ellipse cx="4" cy="16" rx="2.4" ry="3" />
      {/* Main pad */}
      <ellipse cx="16" cy="21" rx="8" ry="7" />
    </svg>
  );
}

export function PawTrail({
  count = 5,
  size = "w-7 h-7",
  className,
}: PawTrailProps) {
  const clampedCount = Math.min(count, PAW_DELAYS.length);

  return (
    <>
      <style>{`
        @keyframes pawBounce {
          0%, 100% { transform: translateY(0)    scale(1);    opacity: 0.25; }
          45%       { transform: translateY(-10px) scale(1.15); opacity: 1;    }
          65%       { transform: translateY(-6px)  scale(1.05); opacity: 0.9;  }
        }
      `}</style>

      <div className={cn("flex items-center justify-center gap-5", className)}>
        {Array.from({ length: clampedCount }).map((_, i) => (
          <PawPrint
            key={i}
            className={cn("text-primary", size)}
            style={{
              transform: `rotate(${PAW_ROTATIONS[i]}deg)`,
              animation: "pawBounce 1.1s ease-in-out infinite",
              animationDelay: `${PAW_DELAYS[i]}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
