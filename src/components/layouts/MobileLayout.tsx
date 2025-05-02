"use client";

import React from "react";
import { TodoList } from "@/components/TodoList";
import { Quadrant } from "@/components/Quadrant";
import { useTodo } from "@/context/TodoContext";

/**
 * MobileLayout Component
 *
 * A dedicated layout component for mobile view that implements:
 * - Vertical stacking of components
 * - Natural height based on content
 * - Full-width sections
 * - Touch-friendly interface
 */
export function MobileLayout() {
  const { quadrants, moveTodo } = useTodo();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Inbox Section */}
      <div className="w-full p-3">
        <TodoList />
      </div>

      {/* Quadrants Section */}
      <div className="w-full p-3">
        <div className="space-y-3">
          <Quadrant
            title="DO NOW"
            subtitle="Urgent & Important"
            todos={quadrants.urgentImportant}
            onDrop={(data) =>
              moveTodo(data.todo, data.fromQuadrant, "urgentImportant")
            }
            quadrant="urgentImportant"
            bgColor="bg-green-50"
          />

          <Quadrant
            title="SCHEDULE"
            subtitle="Not Urgent & Important"
            todos={quadrants.notUrgentImportant}
            onDrop={(data) =>
              moveTodo(data.todo, data.fromQuadrant, "notUrgentImportant")
            }
            quadrant="notUrgentImportant"
            bgColor="bg-blue-50"
          />

          <Quadrant
            title="DELEGATE"
            subtitle="Urgent & Not Important"
            todos={quadrants.urgentNotImportant}
            onDrop={(data) =>
              moveTodo(data.todo, data.fromQuadrant, "urgentNotImportant")
            }
            quadrant="urgentNotImportant"
            bgColor="bg-orange-50"
          />

          <Quadrant
            title="DELETE"
            subtitle="Not Urgent & Not Important"
            todos={quadrants.notUrgentNotImportant}
            onDrop={(data) =>
              moveTodo(data.todo, data.fromQuadrant, "notUrgentNotImportant")
            }
            quadrant="notUrgentNotImportant"
            bgColor="bg-red-50"
          />
        </div>
      </div>
    </div>
  );
}
