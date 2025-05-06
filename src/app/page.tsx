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

/**
 * Main application component that renders the appropriate layout based on screen size
 *
 * Uses the useResponsiveLayout hook to determine which layout to render:
 * - DesktopLayout: For screens >= 1024px (lg breakpoint)
 * - MobileLayout: For screens < 1024px
 */
export default function Home() {
  const isDesktop = useResponsiveLayout();
  const { quadrants, moveTodo, reorderTodosInQuadrant } = useTodo();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Find the active todo and its quadrant
  const activeTodo = React.useMemo(() => {
    if (!activeId) return null;
    for (const key of Object.keys(quadrants) as QuadrantKey[]) {
      const found = quadrants[key].find((t) => t.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, quadrants]);

  // Helper to get quadrant by todo id
  const getQuadrantByTodoId = (id: string): QuadrantKey | null => {
    for (const key of Object.keys(quadrants) as QuadrantKey[]) {
      if (quadrants[key].some((t) => t.id === id)) return key;
    }
    return null;
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
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
      const items = quadrants[fromQuadrant];
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderTodosInQuadrant(fromQuadrant, arrayMove(items, oldIndex, newIndex));
      }
    } else {
      // Move to another quadrant (add to end)
      const todo = quadrants[fromQuadrant].find((t) => t.id === active.id);
      if (todo) {
        moveTodo(todo, fromQuadrant, toQuadrant);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      <DragOverlay dropAnimation={null}>
        {activeTodo ? (
          <div style={{ background: '#fff', borderRadius: 8, width: 320 }}>
            <TodoItem
              todo={activeTodo}
              quadrant={getQuadrantByTodoId(activeTodo.id) || "inbox"}
              onDragStart={() => () => {}}
              onDragEnd={() => {}}
              onDrop={() => {}}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onDelete={() => {}}
              onUpdateText={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
