import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

interface ColorWheelProps {
  color: string;
  onChange: (hex: string) => void;
  size?: number;
  lightness?: number;
}

export function ColorWheel({ color, onChange, size = 140, lightness = 50 }: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [indicatorPos, setIndicatorPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const getPositionFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const wheel = wheelRef.current;
      if (!wheel) return null;
      const rect = wheel.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = rect.width / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      const distance = Math.min(Math.sqrt(x * x + y * y) / radius, 1);
      const angle = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
      return { angle, distance, x, y, radius };
    },
    [],
  );

  const updateColor = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const pos = getPositionFromEvent(e);
      if (!pos) return;
      const hue = Math.round(pos.angle);
      const saturation = Math.round(pos.distance * 100);
      const hex = hslToHex(hue, saturation, lightness);
      const clampedDist = Math.max(0.05, Math.min(pos.distance, 0.92));
      const clampedAngle = (pos.angle * Math.PI) / 180;
      setIndicatorPos({
        x: Math.cos(clampedAngle) * clampedDist * pos.radius,
        y: Math.sin(clampedAngle) * clampedDist * pos.radius,
      });
      onChange(hex);
    },
    [onChange, getPositionFromEvent, lightness],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      updateColor(e);
    },
    [updateColor],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      updateColor(e);
    },
    [updateColor],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const [hue, sat] = hexToHsl(color);
    const angle = (hue * Math.PI) / 180;
    const dist = Math.max(0.05, Math.min(sat / 100, 0.92));
    const r = size / 2;
    setIndicatorPos({
      x: Math.cos(angle) * dist * r,
      y: Math.sin(angle) * dist * r,
    });
  }, [color, size]);

  const half = size / 2;

  return (
    <motion.div
      ref={wheelRef}
      className="relative rounded-full cursor-crosshair select-none"
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 90deg,
            hsl(0, 100%, ${lightness}%),
            hsl(30, 100%, ${lightness}%),
            hsl(60, 100%, ${lightness}%),
            hsl(90, 100%, ${lightness}%),
            hsl(120, 100%, ${lightness}%),
            hsl(150, 100%, ${lightness}%),
            hsl(180, 100%, ${lightness}%),
            hsl(210, 100%, ${lightness}%),
            hsl(240, 100%, ${lightness}%),
            hsl(270, 100%, ${lightness}%),
            hsl(300, 100%, ${lightness}%),
            hsl(330, 100%, ${lightness}%),
            hsl(360, 100%, ${lightness}%)
          )`,
        }}
      />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, white 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute rounded-full border-[1.5px] border-white shadow-[0_0_6px_rgba(0,0,0,0.4)] pointer-events-none z-10"
        style={{
          width: 14,
          height: 14,
          left: half + indicatorPos.x - 7,
          top: half + indicatorPos.y - 7,
        }}
      />
    </motion.div>
  );
}
