"use client";

import React from "react";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTodo } from "@/context/TodoContext";
import { QuadrantKey } from "@/types/todo";
import TodoItem from "@/components/TodoItem";
import { useCardWidth } from "@/hooks/useCardWidth";

/**
 * Main application component that renders the appropriate layout based on screen size
 *
 * Uses the useResponsiveLayout hook to determine which layout to render:
 * - DesktopLayout: For screens >= 1024px (lg breakpoint)
 * - MobileLayout: For screens < 1024px
 *
 * Handles drag-and-drop logic for todos using dnd-kit.
 */
export default function Home() {
  // Responsive layout: true if desktop, false if mobile
  const isDesktop = useResponsiveLayout();
  // Get quadrant data and todo actions from context
  const { quadrants, moveTodo, reorderTodosInQuadrant } = useTodo();
  // Track the currently dragged todo's id
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // Set up DnD sensors (pointer only)
  const sensors = useSensors(useSensor(PointerSensor));
  // Track if the component has mounted (for SSR hydration safety)
  const [hasMounted, setHasMounted] = React.useState(false);
  // Track the width of the dragged card (for overlay sizing)
  const [draggedCardWidth, setDraggedCardWidth] = React.useState<number | undefined>(undefined);
  // Get the standard card width (for overlay)
  const cardWidth = useCardWidth();

  // Set hasMounted to true after first render (avoids SSR/client mismatch)
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Find the active todo object and its quadrant by id
  const activeTodo = React.useMemo(() => {
    if (!activeId) return null;
    for (const key of Object.keys(quadrants) as QuadrantKey[]) {
      const found = quadrants[key].find((t) => t.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, quadrants]);

  // Helper to get the quadrant key for a given todo id
  const getQuadrantByTodoId = (id: string): QuadrantKey | null => {
    for (const key of Object.keys(quadrants) as QuadrantKey[]) {
      if (quadrants[key].some((t) => t.id === id)) return key;
    }
    return null;
  };

  // DnD event handlers
  // When drag starts, set the activeId and record the card width
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id as string);
    // Find the DOM node for the dragged card
    const cardElement = document.querySelector(`[data-todo-id="${event.active.id}"]`);
    if (cardElement) {
      setDraggedCardWidth((cardElement as HTMLElement).offsetWidth);
    }
  };

  // When drag ends, move or reorder the todo as needed
  const handleDragEnd = (event: any) => {
    setActiveId(null);
    setDraggedCardWidth(undefined);
    const { active, over } = event;
    if (!over) return;
    const fromQuadrant = getQuadrantByTodoId(active.id);

    // If dropped on a quadrant, over.id will be the quadrant key
    let toQuadrant: QuadrantKey | null = null;
    if (Object.keys(quadrants).includes(over.id)) {
      toQuadrant = over.id as QuadrantKey;
    } else {
      toQuadrant = getQuadrantByTodoId(over.id);
    }

    if (!fromQuadrant || !toQuadrant) return;
    if (fromQuadrant === toQuadrant) {
      // Reorder within the same quadrant
      // The item will be moved to the new index based on drop position
      const items = quadrants[fromQuadrant];
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderTodosInQuadrant(fromQuadrant, arrayMove(items, oldIndex, newIndex));
      }
    } else {
      // Move to another quadrant
      // No matter where the user drops, always move the todo to the end of the destination quadrant's list
      // (The actual scroll-to-bottom is handled in the Quadrant component after the move)
      const todo = quadrants[fromQuadrant].find((t) => t.id === active.id);
      if (todo) {
        moveTodo(todo, fromQuadrant, toQuadrant);
      }
    }
  };

  // Cancel drag (reset state)
  const handleDragCancel = () => {
    setActiveId(null);
    setDraggedCardWidth(undefined);
  };

  // Avoid rendering until after mount (prevents hydration mismatch)
  if (!hasMounted) return null;

  // Render the DnD context and the appropriate layout
  // DragOverlay shows a floating preview of the dragged todo
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Choose layout based on screen size */}
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      {/* Overlay for the dragged todo card */}
      <DragOverlay dropAnimation={null}>
        {activeTodo ? (
          <div className="bg-white rounded overflow-hidden px-2">
            <TodoItem
              todo={activeTodo}
              quadrant={getQuadrantByTodoId(activeTodo.id) || "inbox"}
              onDragStart={() => () => {}}
              onDragEnd={() => {} }
              onDrop={() => {} }
              onDragOver={() => {} }
              onDragLeave={() => {} }
              onDelete={() => {} }
              onUpdateText={() => {} }
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
