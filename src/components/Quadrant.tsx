"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { Todo, QuadrantKey } from "@/types/todo";
import TodoItem from "@/components/TodoItem";

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

/**
 * Custom hook for handling drag and drop operations
 */
const useDragAndDrop = (
  quadrant: QuadrantKey,
  onDrop: (data: { todo: Todo; fromQuadrant: QuadrantKey }) => void
) => {
  const handleDragStart = useCallback(
    (todo: Todo) => (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ todo, fromQuadrant: quadrant })
      );
    },
    [quadrant]
  );

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      try {
        const data = JSON.parse(
          e.dataTransfer.getData("application/json")
        ) as {
          todo: Todo;
          fromQuadrant: QuadrantKey;
        };
        onDrop(data);
      } catch (error) {
        console.error("Failed to parse drag data:", error);
      }
    },
    [onDrop]
  );

  return {
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
};

/**
 * Renders a list of todo items
 */
const TodoList = React.memo(
  ({
    todos,
    quadrant,
    onDragStart,
    onDragEnd,
    onDrop,
    onDragOver,
    onDragLeave,
    onDelete,
    onToggle,
    onToggleWaiting,
    onUpdateText,
    onUpdateDueDate,
    onUpdateNote,
  }: {
    todos: Todo[];
    quadrant: QuadrantKey;
    onDragStart: (todo: Todo) => (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    onToggleWaiting: (id: string) => void;
    onUpdateText: (id: string, text: string) => void;
    onUpdateDueDate: (id: string, date: Date | undefined) => void;
    onUpdateNote: (id: string, note: string) => void;
  }) => (
    <div className="flex flex-col items-center gap-1.5">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          quadrant={quadrant}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDelete={onDelete}
          onToggle={onToggle}
          onToggleWaiting={onToggleWaiting}
          onUpdateText={onUpdateText}
          onUpdateDueDate={onUpdateDueDate}
          onUpdateNote={onUpdateNote}
        />
      ))}
    </div>
  )
);

TodoList.displayName = "TodoList";

export function Quadrant({
  todos,
  onDrop,
  quadrant,
  title,
  subtitle,
  bgColor,
}: QuadrantProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleDragStart, handleDragEnd, handleDrop } = useDragAndDrop(
    quadrant,
    onDrop
  );

  // Effect to scroll to bottom when todos change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [todos]);

  return (
    <div
      className={`rounded-lg shadow-soft ${bgColor} h-full flex flex-col overflow-hidden`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      data-quadrant={quadrant}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 text-center flex-shrink-0 bg-white/50 backdrop-blur-sm relative z-[1]">
        <h2 className="title text-lg tracking-wide">{title}</h2>
        <p className="subtitle text-sm text-gray-600">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Desktop: Fixed height container with scroll */}
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-auto scrollbar-none rounded-b-lg hidden lg:block"
          role="list"
          aria-label={`${title} tasks`}
        >
          <div className="p-4">
            <TodoList
              todos={todos}
              quadrant={quadrant}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDelete={(id) => console.log(`Delete todo with id: ${id}`)}
              onToggle={(id) => console.log(`Toggle todo with id: ${id}`)}
              onToggleWaiting={(id) => console.log(`Toggle waiting status for todo with id: ${id}`)}
              onUpdateText={(id, text) => console.log(`Update text for todo with id: ${id}, new text: ${text}`)}
              onUpdateDueDate={(id, date) => console.log(`Update due date for todo with id: ${id}, new date: ${date}`)}
              onUpdateNote={(id, note) => console.log(`Update note for todo with id: ${id}, new note: ${note}`)}
            />
          </div>
        </div>

        {/* Fade Overlays */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white from-0% via-white/95 via-40% to-transparent to-60% hidden lg:block z-[1]" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white from-0% via-white/95 via-40% to-transparent to-60% hidden lg:block z-[1]" />

        {/* Mobile: Expanding container */}
        <div className="lg:hidden h-full overflow-y-auto">
          <div className="p-4">
            <TodoList
              todos={todos}
              quadrant={quadrant}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              onDelete={(id) => console.log(`Delete todo with id: ${id}`)}
              onToggle={(id) => console.log(`Toggle todo with id: ${id}`)}
              onToggleWaiting={(id) => console.log(`Toggle waiting status for todo with id: ${id}`)}
              onUpdateText={(id, text) => console.log(`Update text for todo with id: ${id}, new text: ${text}`)}
              onUpdateDueDate={(id, date) => console.log(`Update due date for todo with id: ${id}, new date: ${date}`)}
              onUpdateNote={(id, note) => console.log(`Update note for todo with id: ${id}, new note: ${note}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
