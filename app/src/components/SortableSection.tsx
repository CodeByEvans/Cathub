import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { ClockSection } from "@/modules/clock/components/ClockSection";
import { DateSection } from "@/modules/clock/components/DateSection";
import { Weather } from "@/modules/weather/components/Weather";
import { CallSection } from "@/modules/call/components/organisms/CallSection";
import { SectionId } from "@/@types/window.types";

const SECTION_COMPONENTS: Record<SectionId, React.ComponentType> = {
  clock: ClockSection,
  date: DateSection,
  weather: Weather,
  call: CallSection,
};

export function SortableSection({
  id,
  editable,
}: {
  id: SectionId;
  editable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editable });

  const Component = SECTION_COMPONENTS[id];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative group ${
        isDragging ? "z-50 ring-2 ring-primary/50 rounded-xl" : ""
      }`}
    >
      {editable && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 p-0.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-secondary/70 transition-colors cursor-grab active:cursor-grabbing"
          title="Arrastrar"
        >
          <GripHorizontal className="w-3.5 h-3.5" />
        </button>
      )}

      <Component />
    </div>
  );
}

export function SortableZone({
  id,
  allItems,
  hiddenIds,
  editable,
}: {
  id: "left" | "right";
  allItems: SectionId[];
  hiddenIds: SectionId[];
  editable: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !editable });

  const visibleItems = allItems.filter((i) => !hiddenIds.includes(i));
  const isEmpty = allItems.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center gap-2 flex-1 min-w-0 px-2 py-1 transition-colors ${
        isEmpty
          ? "min-h-[120px] mx-1 rounded-lg border border-dashed border-border/30"
          : ""
      } ${isOver && !isEmpty ? "bg-primary/5 rounded-lg" : ""}`}
    >
      <SortableContext
        items={visibleItems}
        strategy={verticalListSortingStrategy}
      >
        {visibleItems.map((item) => (
          <SortableSection key={item} id={item} editable={editable} />
        ))}
      </SortableContext>
    </div>
  );
}
