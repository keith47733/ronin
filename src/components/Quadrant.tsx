"use client";

import React, { useState } from "react";
import { Todo, QuadrantKey } from "@/types/todo";
import { DndListView } from "@/components/DndListView";
import TodoItem from "@/components/TodoItem";
import { useTodo } from "@/context/TodoContext";
import { useDroppable } from "@dnd-kit/core";

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
  title: string;
  subtitle: string;
  bgColor: string;
}

export function Quadrant({
  todos,
  onDrop,
  quadrant,
  title,
  subtitle,
  bgColor,
}: QuadrantProps) {
  const { reorderTodosInQuadrant } = useTodo();
  const { isOver, setNodeRef } = useDroppable({ id: quadrant });

  const handleReorder = (newOrder: Todo[]) => {
    reorderTodosInQuadrant(quadrant, newOrder);
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg shadow-soft ${bgColor} h-full flex flex-col overflow-hidden relative`}
      data-quadrant={quadrant}
    >
      {/* Header */}
      <div className="px-4 py-1 border-b border-gray-200 text-center flex-shrink-0 bg-white/50 backdrop-blur-sm relative z-[1] rounded-t-lg">
        <h2 className="title text-lg tracking-wide">{title}</h2>
        <p className="subtitle text-sm text-gray-600">{subtitle}</p>
      </div>
      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="mt-2 mb-2 h-full">
          <DndListView
            items={todos}
            onReorder={handleReorder}
            renderItem={(todo, isDragging, attributes, listeners) => (
              <TodoItem
                todo={todo}
                quadrant={quadrant}
                grabHandleProps={{ ...attributes, ...listeners }}
                onDragStart={() => () => {}}
                onDragEnd={() => {}}
                onDrop={() => {}}
                onDragOver={() => {}}
                onDragLeave={() => {}}
                onDelete={() => {}}
                onUpdateText={() => {}}
              />
            )}
            listClassName="gap-1"
          />
        </div>
      </div>
      {isOver && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-inset z-40 pointer-events-none" />
      )}
    </div>
  );
}
