import { Component, ReactNode } from "react";
import { logger } from "@/shared/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Última red de seguridad: un render roto ya nunca deja la ventana en negro. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    logger.error("react", "Error no controlado en la UI", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-neutral-200">
            Algo salió mal
          </p>
          <p className="text-xs text-neutral-500">
            Cierra la app desde el tray y vuelve a abrirla
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
