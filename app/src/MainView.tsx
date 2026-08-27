import { NotesSection } from "./modules/notes/components/NotesSection";
import { Button } from "./shared/components/atoms/button";
import { SettingsPage } from "./modules/settings/SettingsPage";
import LinkModal from "./modules/connection/components/LinkModal";
import React from "react";
import { useConnection } from "./modules/connection/contexts/ConnectionContext";
import { ColorPickerPanel } from "./modules/settings/components/organisms/ColorPickerPanel";
import { WidgetsPanel } from "./modules/settings/components/organisms/WidgetsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { WindowControls } from "./components/WindowControls";
import { YarnBall } from "./shared/components/atoms/yarn-ball";
import { SortableZone } from "./components/SortableSection";
import { useSectionLayout } from "./hooks/useSectionLayout";
import { useWidgetSettings } from "./modules/widgets/context/WidgetSettingsContext";
import { ControlsPosition, SectionId, SectionLayout } from "./@types/window.types";
import {
  DndContext,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// Alturas estimadas por widget (px) para detectar desborde visual en la columna.
const SECTION_HEIGHT: Record<SectionId, number> = {
  date: 28,
  clock: 48,
  weather: 48,
  call: 88,
};
const MAX_SIDE_HEIGHT = 168;

function sideHeight(ids: SectionId[]): number {
  return ids.reduce((sum, id) => sum + SECTION_HEIGHT[id], 0);
}

/** Si un lado desborda la columna, mueve el excedente al otro lado. */
function rebalance(layout: SectionLayout): SectionLayout {
  const result: SectionLayout = {
    left: [...layout.left],
    right: [...layout.right],
  };
  let guard = 0;
  let changed = true;
  while (changed && guard++ < 8) {
    changed = false;
    if (sideHeight(result.left) > MAX_SIDE_HEIGHT && result.left.length > 1) {
      const item = result.left.pop()!;
      result.right.push(item);
      changed = true;
    }
    if (sideHeight(result.right) > MAX_SIDE_HEIGHT && result.right.length > 1) {
      const item = result.right.pop()!;
      result.left.push(item);
      changed = true;
    }
  }
  return result;
}

interface MainViewProps {
  onSimulateIncomingCall: () => void;
  onSimulateInCall: () => void;
  onSimulateOutgoingCall: () => void;
  showColorPicker: boolean;
  onOpenColorPicker: () => void;
  onCloseColorPicker: () => void;
  showWidgetsEditor: boolean;
  onOpenWidgetsEditor: () => void;
  onCloseWidgetsEditor: () => void;
  isCompact: boolean;
  onToggleCompact: () => void;
  controlsPosition: ControlsPosition;
  onControlsPositionChange: (position: ControlsPosition) => void;
}

export function MainView({
  onSimulateIncomingCall,
  onSimulateInCall,
  onSimulateOutgoingCall,
  showColorPicker,
  onOpenColorPicker,
  onCloseColorPicker,
  showWidgetsEditor,
  onOpenWidgetsEditor,
  onCloseWidgetsEditor,
  isCompact,
  onToggleCompact,
  controlsPosition,
  onControlsPositionChange,
}: MainViewProps) {
  const { isLinked } = useConnection();
  const [showSettings, setShowSettings] = React.useState(false);
  const { layout, setLayout } = useSectionLayout();
  const { hiddenSections } = useWidgetSettings();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const findContainer = (id: string): "left" | "right" | null => {
    if (layout.left.includes(id as SectionId)) return "left";
    if (layout.right.includes(id as SectionId)) return "right";
    if (id === "left" || id === "right") return id;
    return null;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLayout((prev) => {
      const from = [...prev[activeContainer]];
      const activeIndex = from.indexOf(activeId as SectionId);
      if (activeIndex === -1) return prev;
      const [moved] = from.splice(activeIndex, 1);

      const to = [...prev[overContainer]];
      const overIndex = to.indexOf(overId as SectionId);
      const newIndex = overIndex >= 0 ? overIndex : to.length;
      to.splice(newIndex, 0, moved);

      return { ...prev, [activeContainer]: from, [overContainer]: to };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      setLayout((prev) => {
        const list = [...prev[activeContainer]];
        const oldIndex = list.indexOf(activeId as SectionId);
        const newIndex = list.indexOf(overId as SectionId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return rebalance({
          ...prev,
          [activeContainer]: arrayMove(list, oldIndex, newIndex),
        });
      });
    } else {
      setLayout((prev) => rebalance(prev));
    }
  };

  const handleOpenColorPicker = () => {
    setShowSettings(false);
    onOpenColorPicker();
  };

  const handleOpenWidgetsEditor = () => {
    setShowSettings(false);
    onOpenWidgetsEditor();
  };

  const getWidth = () => {
    if (showColorPicker) return "w-[940px]";
    if (showWidgetsEditor) return "w-[980px]";
    if (isCompact) return "w-full";
    return "w-[700px]";
  };

  return (
    <main
      className={`rounded-xl border border-border/50 shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
        isCompact ? "p-0 w-full h-screen" : "py-4 h-[200px]"
      } ${getWidth()}`}
      data-tauri-drag-region
    >
      {/* Controles de ventana (solo modo completo, sin el selector de color) */}
      {!isCompact && !showColorPicker && !showWidgetsEditor && (
        <>
          {controlsPosition === "left" && (
            <div className="absolute top-1 left-1 z-10">
              <WindowControls position="left" />
            </div>
          )}
          <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5">
            {controlsPosition === "right" && (
              <>
                <WindowControls position="right" />
                <div className="w-px self-stretch bg-border/30 mx-0.5" />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="h-6 w-6 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
              title="Configuración"
            >
              <YarnBall className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenColorPicker={handleOpenColorPicker}
        onOpenWidgetsEditor={handleOpenWidgetsEditor}
        controlsPosition={controlsPosition}
        onControlsPositionChange={onControlsPositionChange}
      />

      {!isLinked && <LinkModal />}

      <AnimatePresence mode="wait">
        {isCompact ? (
          <motion.section
            key="compact"
            className="group h-full relative"
            data-tauri-drag-region
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <NotesSection isCompact onToggleCompact={onToggleCompact} />
          </motion.section>
        ) : (
          <motion.section
            key="full"
            className="flex h-full divide-x divide-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div
                className={
                  showColorPicker || showWidgetsEditor
                    ? "flex divide-x divide-border/30 flex-1 min-w-0"
                    : "flex divide-x divide-border/30 flex-1"
                }
              >
                <SortableZone
                  id="left"
                  allItems={layout.left}
                  hiddenIds={hiddenSections}
                  editable={showColorPicker || showWidgetsEditor}
                />
                <NotesSection onToggleCompact={onToggleCompact} />
                <SortableZone
                  id="right"
                  allItems={layout.right}
                  hiddenIds={hiddenSections}
                  editable={showColorPicker || showWidgetsEditor}
                />
              </div>
            </DndContext>

            {showColorPicker && (
              <ColorPickerPanel onClose={onCloseColorPicker} />
            )}

            {showWidgetsEditor && (
              <WidgetsPanel onClose={onCloseWidgetsEditor} />
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {import.meta.env.DEV && !isCompact && (
        <div className="absolute bottom-2 left-2 z-50 flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
            onClick={onSimulateIncomingCall}
            title="Simular entrante"
          >
            📞
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
            onClick={onSimulateInCall}
            title="Simular en llamada"
          >
            🎙
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
            onClick={onSimulateOutgoingCall}
            title="Simular saliente"
          >
            📲
          </Button>
        </div>
      )}
    </main>
  );
}
