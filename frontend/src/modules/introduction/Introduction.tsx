import React from "react";

import { useState } from "react";
import {
  Clock,
  MessageSquare,
  Phone,
  Palette,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Monitor,
  AppWindow,
  Layers,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/globals/components/atoms/button";
import { CathubLogo } from "@/globals/components/atoms/logo";
import { themeService } from "@/modules/settings/services/theme.service";
import { windowService } from "../settings/services/window.service";

type FeatureType = "clock" | "messages" | "call" | "theme" | "behavior";
type ThemeType = "light" | "dark" | "glass";
type BehaviorType = "widget" | "app" | "floating";

interface Step {
  title: string;
  content: string;
  showLogo?: boolean;
  feature?: FeatureType;
}

interface IntroductionProps {
  onComplete?: () => void;
  onBehaviorChange?: (behavior: BehaviorType) => void;
}

export function Introduction({ onComplete }: IntroductionProps) {
  const [step, setStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("light");
  const [selectedBehavior, setSelectedBehavior] = useState<BehaviorType | null>(
    null,
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const behaviorDetails: Record<
    BehaviorType,
    { title: string; content: string }
  > = {
    widget: {
      title: "Widget en escritorio",
      content:
        "Se ancla en tu escritorio como un gadget. No ocupa espacio en la barra de tareas y siempre está ahí sin molestar.",
    },
    app: {
      title: "Ventana normal",
      content:
        "Se comporta como cualquier otra app. Puedes minimizarla, moverla y alternar con otras ventanas fácilmente.",
    },
    floating: {
      title: "Siempre visible",
      content:
        "Flota sobre todas las demás ventanas. Perfecto si quieres tenerla presente mientras trabajas en otra cosa.",
    },
  };

  const steps: Step[] = [
    {
      title: "Bienvenido a Cathub",
      content:
        "Manten la conexion con quien mas importa. Un espacio para ustedes dos.",
      showLogo: true,
    },
    {
      title: "Tu tiempo juntos",
      content:
        "Ve la hora actual y el nombre de tu pareja siempre visible. Cada momento cuenta.",
      feature: "clock",
    },
    {
      title: "Notas rapidas",
      content:
        "Envia y recibe mensajes instantaneos con estilo de papel. Recordatorios simples.",
      feature: "messages",
    },
    {
      title: "Siempre conectados",
      content: "Llama con un solo click y ve cuando fue su ultima conexion.",
      feature: "call",
    },
    {
      title: "Comportamiento del widget",
      content: "Elige como quieres que Cathub se comporte en tu escritorio.",
      feature: "behavior",
    },
    {
      title: "Tu estilo",
      content: "Personaliza Cathub con el tema que mas te guste.",
      feature: "theme",
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (isAnimating) return;

    if (step < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (isAnimating || step === 0) return;

    setIsAnimating(true);
    setTimeout(() => {
      setStep(step - 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleThemeChange = (theme: ThemeType) => {
    themeService.setTheme(theme);
    setSelectedTheme(theme);
  };

  const handleBehaviorChange = (behavior: BehaviorType) => {
    windowService.setBehavior(behavior);
    setSelectedBehavior(behavior);
  };

  const FeatureIcon = ({ feature }: { feature: FeatureType }) => {
    const icons: Record<FeatureType, React.ReactNode> = {
      clock: <Clock className="w-8 h-8" />,
      messages: <MessageSquare className="w-8 h-8" />,
      call: <Phone className="w-8 h-8" />,
      behavior: <Monitor className="w-8 h-8" />,
      theme: <Palette className="w-8 h-8" />,
    };
    return icons[feature];
  };

  const renderFeaturePreview = (feature: FeatureType) => {
    if (feature === "behavior") {
      const options: {
        value: BehaviorType;
        label: string;
        sub: string;
        icon: React.ReactNode;
      }[] = [
        {
          value: "widget",
          label: "Widget",
          sub: "Solo en escritorio",
          icon: <Monitor className="w-4 h-4" />,
        },
        {
          value: "app",
          label: "App",
          sub: "Ventana normal",
          icon: <AppWindow className="w-4 h-4" />,
        },
        {
          value: "floating",
          label: "Flotante",
          sub: "Siempre visible",
          icon: <Layers className="w-4 h-4" />,
        },
      ];

      return (
        <div className="flex flex-col gap-1.5">
          {options.map(({ value, label, sub, icon }) => (
            <button
              key={value}
              onClick={() => handleBehaviorChange(value)}
              className={cn(
                "w-44 h-9 rounded-lg flex items-center gap-3 px-3 transition-all duration-300 border-2",
                "bg-secondary/50",
                selectedBehavior === value
                  ? "border-primary ring-2 ring-primary/30 scale-[1.02] bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 transition-colors duration-300",
                  selectedBehavior === value
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {icon}
              </div>
              <div className="flex-1 text-left leading-none">
                <div className="text-xs font-semibold text-foreground">
                  {label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {sub}
                </div>
              </div>
              {selectedBehavior === value && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      );
    }

    if (feature === "theme") {
      return (
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange("light")}
            className={cn(
              "w-14 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2",
              "bg-gradient-to-b from-slate-50 to-slate-100",
              selectedTheme === "light"
                ? "border-primary ring-2 ring-primary/30 scale-105"
                : "border-slate-200 hover:border-slate-300 hover:scale-102",
            )}
            title="Tema claro"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-300 to-slate-400" />
            <span className="text-[10px] text-slate-600 font-medium">
              Claro
            </span>
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className={cn(
              "w-14 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2",
              "bg-gradient-to-b from-slate-800 to-slate-900",
              selectedTheme === "dark"
                ? "border-primary ring-2 ring-primary/30 scale-105"
                : "border-slate-700 hover:border-slate-600 hover:scale-102",
            )}
            title="Tema oscuro"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-500" />
            <span className="text-[10px] text-slate-300 font-medium">
              Oscuro
            </span>
          </button>
          <button
            onClick={() => handleThemeChange("glass")}
            className={cn(
              "w-14 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2",
              "bg-gradient-to-b from-white/40 to-white/20 backdrop-blur-sm",
              selectedTheme === "glass"
                ? "border-primary ring-2 ring-primary/30 scale-105"
                : "border-slate-300/30 hover:border-slate-400/50 hover:scale-102",
            )}
            title="Tema cristal"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-300 to-slate-400 opacity-80" />
            <span className="text-[10px] text-slate-600 font-medium">
              Cristal
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="w-16 h-16 bg-primary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-primary/20 text-primary">
        <FeatureIcon feature={feature} />
      </div>
    );
  };

  return (
    <section className="w-[700px] h-[200px] bg-background rounded-xl border border-border/50 shadow-xl overflow-hidden">
      <div className="h-full flex flex-col justify-between p-5">
        {/* Main content */}
        <div
          className={cn(
            "flex items-center gap-6 transition-all duration-300",
            isAnimating
              ? "opacity-0 translate-x-4"
              : "opacity-100 translate-x-0",
          )}
        >
          {/* Logo or feature preview */}
          <div className="flex-shrink-0">
            {currentStep.showLogo ? (
              <div className="relative">
                <CathubLogo size="lg" className="shadow-xl" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-pulse" />
              </div>
            ) : currentStep.feature ? (
              renderFeaturePreview(currentStep.feature)
            ) : null}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h1
              key={`title-${currentStep.feature === "behavior" && selectedBehavior ? selectedBehavior : step}`}
              className="text-xl font-bold text-foreground mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              {currentStep.feature === "behavior" && selectedBehavior
                ? behaviorDetails[selectedBehavior].title
                : currentStep.title}
            </h1>
            <p
              key={`content-${currentStep.feature === "behavior" && selectedBehavior ? selectedBehavior : step}`}
              className="text-sm text-muted-foreground leading-relaxed line-clamp-2 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-75"
            >
              {currentStep.feature === "behavior" && selectedBehavior
                ? behaviorDetails[selectedBehavior].content
                : currentStep.content}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between">
          {/* Progress indicators */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 cursor-pointer",
                  index === step
                    ? "w-8 bg-primary"
                    : index < step
                      ? "w-2 bg-primary/50 hover:bg-primary/70"
                      : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40",
                )}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={isAnimating}
                className="h-9 px-3 bg-secondary/50 hover:bg-secondary border-border/50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Atras
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              disabled={isAnimating}
              className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
            >
              {step === steps.length - 1 ? (
                <>
                  Comenzar
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Introduction;
