export interface ButtonLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// ButtonLayout.tsx
export const ButtonLayout: React.FC<ButtonLayoutProps> = ({
  children,
  className,
}) => (
  <div className="h-full flex items-center p-4">
    <div className={`flex gap-4 flex-1 ${className}`}>{children}</div>
  </div>
);
