export type BehaviorType = "widget" | "app" | "floating";

export type ControlsPosition = "left" | "right";

export type SectionId = "clock" | "date" | "weather" | "call";

export interface SectionLayout {
  left: SectionId[];
  right: SectionId[];
}

export type DateFormat = "full" | "short";

export type ClockFormat = "24h" | "12h";
