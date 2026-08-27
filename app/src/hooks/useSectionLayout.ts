import { useEffect, useState } from "react";
import {
  settingsRepository,
  DEFAULT_SECTION_LAYOUT,
} from "@/modules/settings/services/settings.repository";
import { SectionLayout } from "@/@types/window.types";

export function useSectionLayout() {
  const [layout, setLayoutState] = useState<SectionLayout>(
    DEFAULT_SECTION_LAYOUT,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    settingsRepository
      .getSectionLayout()
      .then((l) => setLayoutState(l))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setLayout = (
    next: SectionLayout | ((prev: SectionLayout) => SectionLayout),
  ) => {
    setLayoutState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      settingsRepository.setSectionLayout(value).catch(() => {});
      return value;
    });
  };

  return { layout, setLayout, ready };
}
