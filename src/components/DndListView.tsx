import React from "react";
import {
  // DndContext,
  // closestCenter,
  // PointerSensor,
  // useSensor,
  // useSensors,
  DragOverlay,
  useDndContext,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Todo } from "@/types/todo";

interface DndListViewProps {
  items: Todo[];
  onReorder: (newOrder: Todo[]) => void;
  renderItem: (todo: Todo, isDragging: boolean, attributes: any, listeners: any) => React.ReactNode;
  listClassName?: string;
  gradientColor?: string;
  quadrantId: string;
}

function SortableItem({ todo, renderItem }: { todo: Todo; renderItem: (todo: Todo, isDragging: boolean, attributes: any, listeners: any) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(todo, isDragging, attributes, listeners)}
    </div>
  );
}

export function DndListView({ items, onReorder, renderItem, listClassName, gradientColor, quadrantId }: DndListViewProps) {
  // Remove DndContext and sensors
  // const [activeId, setActiveId] = React.useState<string | null>(null);
  // const sensors = useSensors(useSensor(PointerSensor));
  // const activeTodo = items.find((t) => t.id === activeId) || null;

  // Only show gradients if scrollable
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  const [atTop, setAtTop] = React.useState(true);
  const [atBottom, setAtBottom] = React.useState(false);

  const { active, over } = useDndContext();

  React.useEffect(() => {
    const checkScrollable = () => {
      const el = scrollRef.current;
      if (!el) return;
      setIsScrollable(el.scrollHeight > el.clientHeight + 1); // allow for rounding
      setAtTop(el.scrollTop === 0);
      setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 2);
    };
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollable);
    }
    return () => {
      window.removeEventListener("resize", checkScrollable);
      if (el) el.removeEventListener("scroll", checkScrollable);
    };
  }, [items.length]);

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Show gradient masks only when not at top/bottom */}
      {isScrollable && !atTop && (
        <div className={`pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b ${gradientColor || 'from-white via-white/60 to-transparent'} z-[999]`} />
      )}
      {isScrollable && !atBottom && (
        <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t ${gradientColor || 'from-white via-white/60 to-transparent'} z-[999]`} />
      )}
      {/* Scrollable List */}
      <div className={`flex-1 overflow-y-auto scrollbar-none scroll-smooth relative z-0 flex flex-col pb-2 ${listClassName || ''}`} ref={scrollRef}>
        <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {items.map((todo) => (
            <SortableItem key={todo.id} todo={todo} renderItem={renderItem} />
          ))}
        </SortableContext>
        {/* No drop zone indicators here */}
      </div>
    </div>
  );
} 