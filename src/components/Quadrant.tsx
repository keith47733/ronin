"use client";

import React, { useRef } from "react";
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

export function Quadrant({
  todos,
  onDrop,
  quadrant,
  title,
  subtitle,
  bgColor,
}: QuadrantProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart =
    (todo: Todo, fromQuadrant: QuadrantKey) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ todo, fromQuadrant })
      );
    };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className={`rounded-lg shadow-soft ${bgColor} min-h-[280px] lg:h-full flex flex-col`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
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
      }}
      data-quadrant={quadrant}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 text-center flex-shrink-0 bg-white/50 backdrop-blur-sm">
        <h2 className="title text-lg tracking-wide">{title}</h2>
        <p className="subtitle text-sm text-gray-600">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        {/* Desktop: Fixed height container with scroll */}
        <div
          ref={containerRef}
          className="h-full overflow-y-auto scrollbar-none rounded-b-lg hidden lg:block"
          role="list"
          aria-label={`${title} tasks`}
        >
          <div className="px-4 pt-3 pb-16">
            <div className="space-y-2 flex flex-col items-center">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  quadrant={quadrant}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Fade Overlays */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white from-5% via-white/40 via-30% to-transparent to-90% hidden lg:block" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white from-5% via-white/40 via-30% to-transparent to-90% hidden lg:block" />

        {/* Mobile: Expanding container */}
        <div className="lg:hidden h-full overflow-y-auto">
          <div className="p-4">
            <div className="space-y-2 flex flex-col items-center">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  quadrant={quadrant}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
