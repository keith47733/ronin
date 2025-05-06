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
 * A streamlined layout component optimized for mobile devices that implements
 * the Eisenhower Matrix methodology in a vertical, scrollable interface.
 * 
 * Key Features:
 * 1. Layout Structure:
 *    - Vertical stacking of components
 *    - Full-width sections
 *    - Natural height based on content
 *    - Smooth scrolling behavior
 * 
 * 2. Touch Optimization:
 *    - Larger touch targets
 *    - Adequate spacing between elements
 *    - Touch-friendly drag and drop
 *    - Responsive to different screen sizes
 * 
 * 3. Performance:
 *    - Optimized for mobile devices
 *    - Efficient rendering of quadrants
 *    - Smooth animations
 *    - Minimal DOM nesting
 * 
 * 4. User Experience:
 *    - Clear visual hierarchy
 *    - Easy navigation
 *    - Intuitive interactions
 *    - Consistent spacing
 * 
 * Component Structure:
 * MobileLayout
 * ├── Inbox Section
 * │   └── TodoList
 * └── Quadrants Section
 *     ├── Quadrant (DO NOW)
 *     ├── Quadrant (SCHEDULE)
 *     ├── Quadrant (DELEGATE)
 *     └── Quadrant (DELETE)
 */

/**
 * Quadrant Configuration
 * 
 * Defines the structure and appearance of each quadrant in the Eisenhower Matrix.
 * Each quadrant has:
 * - title: The main heading for the quadrant
 * - subtitle: The description of the quadrant's purpose
 * - quadrant: The unique identifier for the quadrant
 * - bgColor: The background color class for visual distinction
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
