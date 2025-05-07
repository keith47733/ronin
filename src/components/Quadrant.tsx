"use client";

import React, { useState } from "react";
import { Todo, QuadrantKey, QuadrantConfig } from "@/types/todo";
import { DndListView } from "@/components/DndListView";
import TodoItem from "@/components/TodoItem";
import { useTodo } from "@/context/TodoContext";
import { useDroppable, useDndContext } from "@dnd-kit/core";

/**
 * Quadrant Component
 *
 * A core component that represents one of the four quadrants in the Eisenhower Matrix.
 * This component manages the display and interaction of todos within a specific quadrant.
 *
 * Layout Behavior:
 * - Desktop (lg breakpoint and above):
 *   - Fixed height with internal scrolling
 *   - Gradient overlays for scroll indicators
 *   - Scroll chevrons for navigation
 *   - Hidden scrollbars with maintained functionality
 *
 * - Mobile:
 *   - Natural height based on content
 *   - No scroll indicators or chevrons
 *   - Visible overflow
 *
 * Visual Features:
 * - Customizable background colors
 * - Gradient overlays for scroll indicators
 * - Shadow effects for depth
 * - Rounded corners for modern look
 *
 * Interaction Features:
 * - Drag and drop support
 * - Scroll chevron navigation
 * - Touch-friendly on mobile
 * - Keyboard accessible
 */

interface QuadrantProps {
  todos: Todo[];
  onDrop: (data: { todo: Todo; fromQuadrant: QuadrantKey }) => void;
  quadrant: QuadrantKey;
  config: QuadrantConfig;
}

export function Quadrant({
  todos,
  onDrop,
  quadrant,
  config,
}: QuadrantProps) {
  const { reorderTodosInQuadrant, moveTodo } = useTodo();
  const { isOver, setNodeRef } = useDroppable({ id: quadrant });
  const { active, over } = useDndContext();

  const todoIds = todos.map(t => t.id);
  // Show blue outline if a drag is in progress and the dragged item is over this quadrant (including its children)
  const showRing = !!active && (over?.id === quadrant || (over?.id && todoIds.includes(String(over.id))));

  const handleReorder = (newOrder: Todo[]) => {
    reorderTodosInQuadrant(quadrant, newOrder);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    // Only handle drop if this quadrant is the drop target
    if (over?.id === quadrant && active) {
      // Get the dragged todo's id and fromQuadrant
      const { id: draggedId, data } = active;
      let fromQuadrant = null;
      let todo = null;
      if (data?.current) {
        fromQuadrant = data.current.fromQuadrant;
        todo = data.current.todo;
      }
      // Fallback: try to find the todo in this quadrant
      if (!todo) {
        todo = todos.find((t) => t.id === draggedId);
      }
      if (!todo || !fromQuadrant) return;
      // If the todo is already in this quadrant and at the end, do nothing
      if (todo.quadrant === quadrant && todos[todos.length - 1]?.id === todo.id) return;
      // Move to end
      if (fromQuadrant === quadrant) {
        reorderTodosInQuadrant(quadrant, [
          ...todos.filter((t) => t.id !== todo.id),
          todo,
        ]);
      } else {
        // Move from another quadrant
        // Use moveTodo to update the quadrant, then reorder
        moveTodo(todo, fromQuadrant, quadrant);
        reorderTodosInQuadrant(quadrant, [
          ...todos,
          { ...todo, quadrant },
        ]);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg shadow-soft ${config.bgColor} h-full flex flex-col overflow-hidden relative`}
      data-quadrant={quadrant}
      onDragOver={(e) => {
        // Prevent default to allow drop
        if (over?.id === quadrant) e.preventDefault();
      }}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`px-4 py-1 px-2 text-center flex-shrink-0 ${config.headerBgColor} backdrop-blur-sm relative z-[1] rounded-t-lg`}>
        <h2 className="title text-lg tracking-wide">{config.title}</h2>
        <p className="subtitle text-sm text-gray-600">{config.subtitle}</p>
        <div className="border-b border-gray-400 mx-1 mt-1" />
      </div>
      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="mt-2 mb-2 h-full pb-2">
          <DndListView
            items={todos}
            onReorder={handleReorder}
            renderItem={(todo, isDragging, attributes, listeners) => (
              <TodoItem
                todo={todo}
                quadrant={quadrant}
                grabHandleProps={{ ...attributes, ...listeners }}
                onDragStart={() => () => {}}
                onDragEnd={() => {} }
                onDrop={() => {}}
                onDragOver={() => {}}
                onDragLeave={() => {}}
                onDelete={() => {}}
                onUpdateText={() => {}}
              />
            )}
            listClassName="gap-1"
            gradientColor={config.gradientColor}
            quadrantId={quadrant}
          />
        </div>
      </div>
      {showRing && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-inset z-10 pointer-events-none" />
      )}
    </div>
  );
}
