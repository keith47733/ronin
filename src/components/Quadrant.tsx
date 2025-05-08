"use client";

import React, { useRef, useEffect } from "react";
import { Todo, QuadrantKey, QuadrantConfig } from "@/types/todo";
import { DndListView } from "@/components/DndListView";
import TodoItem from "@/components/TodoItem";
import { useTodo } from "@/context/TodoContext";
import { useDroppable, useDndContext } from "@dnd-kit/core";

/**
 * Quadrant
 *
 * - Displays a list of todos for a specific quadrant
 * - Handles drag-and-drop for moving/reordering todos
 * - Applies quadrant-specific styles and layout
 * - Responsive: scrollable on desktop, natural height on mobile
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
  // Context for todo actions
  const { reorderTodosInQuadrant, moveTodo, pendingMove, setPendingMove } = useTodo();
  // DnD-kit hooks for droppable area and drag state
  const { isOver, setNodeRef } = useDroppable({ id: quadrant });
  const { active, over } = useDndContext();

  // Ref to access DndListView's scrollToBottom method
  const listViewRef = useRef<{ scrollToBottom: () => void }>(null);

  // List of todo ids in this quadrant
  const todoIds = todos.map(t => t.id);
  // Show blue outline if a drag is in progress and the dragged item is over this quadrant (or its children)
  const showRing = !!active && (over?.id === quadrant || (over?.id && todoIds.includes(String(over.id))));

  // Handler for reordering todos within this quadrant
  const handleReorder = (newOrder: Todo[]) => {
    reorderTodosInQuadrant(quadrant, newOrder);
  };

  // Robustly handle cross-quadrant moves using pendingMove
  /**
   * useEffect: Handles robust, race-condition-free cross-quadrant moves.
   * - When a todo is moved to this quadrant (pendingMove is set),
   *   this effect detects the new todo in the quadrant's list.
   * - It appends the moved todo to the end, reorders all todos,
   *   and persists the new order to the backend.
   * - This ensures the moved todo is always last and order is always correct.
   */
  useEffect(() => {
    if (pendingMove && pendingMove.toQuadrant === quadrant) {
      // Only handle if the todo is not completed (i.e., not in finished list)
      const movedTodo = todos.find(t => t.id === pendingMove.todoId);
      if (!movedTodo || movedTodo.completed) return;
      // Only reorder if not already at the end
      if (todos[todos.length - 1]?.id === pendingMove.todoId) {
        // Scroll to bottom so the new todo is visible
        setTimeout(() => {
          const scrollContainer = listViewRef.current && (listViewRef.current as any).scrollRef?.current;
          const container = scrollContainer || document.querySelector(`[data-quadrant='${quadrant}'] .overflow-y-auto`);
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
          setPendingMove(null);
        }, 50);
        return;
      }
      // Remove if already present (shouldn't be, but for safety)
      const filtered = todos.filter(t => t.id !== movedTodo.id);
      // Append to end and reorder
      reorderTodosInQuadrant(quadrant, [...filtered, movedTodo]);
      // pendingMove will be cleared after scroll
    }
  }, [todos, quadrant, pendingMove, reorderTodosInQuadrant, setPendingMove]);

  // Handler for dropping a todo into this quadrant
  /**
   * Handles drop events for drag-and-drop.
   * - Intra-quadrant: Immediately reorders the todo to the end and persists order.
   * - Cross-quadrant: Calls moveTodo, which triggers the useEffect above to robustly reorder after state updates.
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (active) {
      const { id: draggedId, data } = active;
      let fromQuadrant = null;
      let todo = null;
      if (data?.current) {
        fromQuadrant = data.current.fromQuadrant;
        todo = data.current.todo;
      }
      if (!todo || !fromQuadrant) return;
      if (fromQuadrant === quadrant) {
        // Intra-quadrant: filter out and append to end, then reorder
        reorderTodosInQuadrant(quadrant, [
          ...todos.filter((t) => t.id !== todo.id),
          todo,
        ]);
      } else {
        // Inter-quadrant: just call moveTodo, let useEffect handle reordering
        moveTodo(todo, fromQuadrant, quadrant);
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
      {/* Header: title and subtitle for the quadrant */}
      <div className={`px-4 py-1 px-2 text-center flex-shrink-0 ${config.headerBgColor} backdrop-blur-sm relative z-[1] rounded-t-lg`}>
        <h2 className="title text-lg tracking-wide">{config.title}</h2>
        <p className="subtitle text-sm text-gray-600">{config.subtitle}</p>
        <div className="border-b border-gray-400 mx-1 mt-1" />
      </div>
      {/* Content: list of todos, scrollable on desktop */}
      <div className="flex-1 relative overflow-hidden">
        <div className="mt-2 mb-2 h-full pb-2">
          <DndListView
            ref={listViewRef}
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
      {/* Show a blue ring when a todo is dragged over this quadrant */}
      {showRing && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-inset z-10 pointer-events-none" />
      )}
    </div>
  );
}
