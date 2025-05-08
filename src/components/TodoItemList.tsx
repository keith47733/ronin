"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Todo, QuadrantKey } from "@/types/todo";
import TodoItem from "@/components/TodoItem";
import { useTodo } from "@/context/TodoContext";

interface TodoItemListProps {
  todos: Todo[];
  quadrant: QuadrantKey;
  onDelete: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

function DropZone({
  isActive,
  onDragOver,
  onDrop,
  onDragLeave,
  children,
}: {
  isActive: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={
        isActive
          ? "w-[98%] mx-auto mb-1 bg-blue-50 border-2 border-blue-300 rounded shadow-lg min-h-[44px] flex items-center justify-center transition-all duration-150"
          : "h-2"
      }
      style={isActive ? { scrollSnapAlign: "start" } : { minHeight: 8 }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {isActive && children}
    </div>
  );
}

export function TodoItemList({
  todos,
  quadrant,
  onDelete,
  onUpdateText,
}: TodoItemListProps) {
  const { reorderTodo, moveTodo } = useTodo();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleDragStart = (todo: Todo) => (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedId(todo.id);
    setDragOverIndex(todos.findIndex((t) => t.id === todo.id));
    // Hide default drag image
    const img = new window.Image();
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";
    e.dataTransfer.setDragImage(img, 0, 0);
    // Track mouse
    document.addEventListener("dragover", handleMouseMove);
  };

  const handleMouseMove = (e: DragEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  const handleDragOverZone = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropZone = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const draggedTodo: Todo = data.todo;
      const fromQuadrant: QuadrantKey = data.fromQuadrant;
      if (fromQuadrant === quadrant) {
        reorderTodo(draggedTodo.id, quadrant, index);
      } else {
        moveTodo(draggedTodo, fromQuadrant, quadrant);
        reorderTodo(draggedTodo.id, quadrant, index);
      }
    } catch {}
    setDraggedId(null);
    setDragOverIndex(null);
    setMouse(null);
    document.removeEventListener("dragover", handleMouseMove);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverIndex(null);
    setMouse(null);
    document.removeEventListener("dragover", handleMouseMove);
  };

  // Find the dragged todo and its original index
  const draggedTodo = todos.find((t) => t.id === draggedId) || null;
  const originalIndex = draggedId ? todos.findIndex((t) => t.id === draggedId) : -1;

  let children: React.ReactNode[] = [];

  if (draggedId && draggedTodo) {
    for (let i = 0; i <= todos.length; i++) {
      // Drop zone: min-h-4 for easy targeting, only show blue line when active
      const isDropZoneActive = dragOverIndex === i || (dragOverIndex === null && i === originalIndex);
      children.push(
        <div
          key={`dropzone-${i}`}
          className={`min-h-4 flex items-center justify-center -my-2 ${isDropZoneActive ? "" : "pointer-events-auto"}`}
          style={{ position: "relative" }}
          onDragOver={handleDragOverZone(i)}
          onDrop={handleDropZone(i)}
        >
          {isDropZoneActive && (
            <div
              className="absolute left-0 right-0 h-1 bg-blue-400 rounded"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            />
          )}
        </div>
      );
      // Item (skip if it's the dragged one)
      if (i < todos.length) {
        if (todos[i].id === draggedId) continue;
        children.push(
          <div
            key={todos[i].id}
            className="w-[95%] mx-auto scroll-mt-1 scroll-mb-1"
            style={{ scrollSnapAlign: "start" }}
            draggable
            onDragStart={handleDragStart(todos[i])}
            onDragEnd={handleDragEnd}
          >
            <TodoItem
              todo={todos[i]}
              quadrant={quadrant}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={() => {}}
              onDragOver={() => {}}
              onDragLeave={() => {}}
              onDelete={onDelete}
              onUpdateText={onUpdateText}
            />
          </div>
        );
      }
    }
  } else {
    // Not dragging: render list normally, no drop indicators
    children = todos.map((todo) => (
      <div
        key={todo.id}
        className="w-[95%] mx-auto scroll-mt-1 scroll-mb-1"
        style={{ scrollSnapAlign: "start" }}
        draggable
        onDragStart={handleDragStart(todo)}
        onDragEnd={handleDragEnd}
      >
        <TodoItem
          todo={todo}
          quadrant={quadrant}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={() => {}}
          onDragOver={() => {}}
          onDragLeave={() => {}}
          onDelete={onDelete}
          onUpdateText={onUpdateText}
        />
      </div>
    ));
  }

  // Floating preview of dragged card
  const floatingPreview =
    draggedTodo && mouse
      ? createPortal(
          <div
            style={{
              position: "fixed",
              left: mouse.x + 8,
              top: mouse.y + 8,
              pointerEvents: "none",
              zIndex: 50,
              width: listRef.current ? listRef.current.offsetWidth * 0.98 : 320,
              maxWidth: 480,
            }}
          >
            <div className="bg-white shadow-lg rounded w-full opacity-90">
              <TodoItem
                todo={draggedTodo}
                quadrant={quadrant}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={() => {}}
                onDragOver={() => {}}
                onDragLeave={() => {}}
                onDelete={onDelete}
                onUpdateText={onUpdateText}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col gap-1 py-1" ref={listRef}>
      {children}
      {floatingPreview}
    </div>
  );
} 