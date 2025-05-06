"use client";

import React from "react";
import { TodoList } from "@/components/TodoList";
import { Quadrant } from "@/components/Quadrant";
import { useTodo } from "@/context/TodoContext";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { QuadrantKey } from "@/types/todo";

/**
 * MobileLayout Component
 *
 * A dedicated layout component for mobile view that implements:
 * - Vertical stacking of components
 * - Natural height based on content
 * - Full-width sections
 * - Touch-friendly interface
 */
const QUADRANT_CONFIG = [
  {
    title: "DO NOW",
    subtitle: "Urgent & Important",
    quadrant: "urgentImportant",
    bgColor: "bg-green-50",
  },
  {
    title: "SCHEDULE",
    subtitle: "Not Urgent & Important",
    quadrant: "notUrgentImportant",
    bgColor: "bg-blue-50",
  },
  {
    title: "DELEGATE",
    subtitle: "Urgent & Not Important",
    quadrant: "urgentNotImportant",
    bgColor: "bg-orange-50",
  },
  {
    title: "DELETE",
    subtitle: "Not Urgent & Not Important",
    quadrant: "notUrgentNotImportant",
    bgColor: "bg-red-50",
  },
];

export function MobileLayout() {
  const { quadrants } = useTodo();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Inbox Section */}
      <div className="w-full p-3">
        <TodoList />
      </div>

      {/* Quadrants Section */}
      <div className="w-full p-3">
        <div className="space-y-3">
          {(QUADRANT_CONFIG as { title: string; subtitle: string; quadrant: QuadrantKey; bgColor: string }[]).map((config) => (
            <SortableContext
              key={config.quadrant}
              items={quadrants[config.quadrant as QuadrantKey].map((t: any) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Quadrant
                title={config.title}
                subtitle={config.subtitle}
                todos={quadrants[config.quadrant as QuadrantKey]}
                onDrop={() => {}}
                quadrant={config.quadrant as QuadrantKey}
                bgColor={config.bgColor}
              />
            </SortableContext>
          ))}
        </div>
      </div>
    </div>
  );
}
