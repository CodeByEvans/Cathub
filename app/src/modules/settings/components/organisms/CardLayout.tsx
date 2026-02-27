import React from "react";

export interface CardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const CardLayout: React.FC<CardLayoutProps> = ({
  children,
  className,
}) => (
  <div className="flex-1 flex items-center p-4">
    <div className={`flex flex-1 gap-4 ${className}`}>{children}</div>
  </div>
);
