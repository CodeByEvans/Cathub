"use client";

import { CathubLogo } from "@/globals/components/atoms/logo";
import { useState, useEffect } from "react";

interface ClockSectionProps {
  partnerName: string;
  partnerAvatar?: string;
}

export function ClockSection({
  partnerName,
  partnerAvatar,
}: ClockSectionProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 h-full min-w-[180px]">
      {/* Time display */}
      <div className="text-4xl font-bold text-foreground tracking-tight">
        {formatTime(time)}
      </div>

      {/* Date */}
      <div className="text-xs text-muted-foreground capitalize">
        {formatDate(time)}
      </div>

      {/* Partner info */}
      <div className="flex items-center gap-2 mt-1">
        {partnerAvatar ? (
          <img
            src={partnerAvatar || "/placeholder.svg"}
            alt={partnerName}
            className="w-6 h-6 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <CathubLogo size="sm" className="w-6 h-6" />
        )}
        <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
          {partnerName}
        </span>
      </div>
    </div>
  );
}
