"use client";

import React from "react";
import { TodoList } from "@/components/TodoList";
import { Quadrant } from "@/components/Quadrant";
import { useTodo } from "@/context/TodoContext";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { QuadrantKey } from "@/types/todo";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";
import { Todo } from "@/types/todo";

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
          {(["urgentImportant", "notUrgentImportant", "urgentNotImportant", "notUrgentNotImportant"] as QuadrantKey[]).map((quadrantKey) => {
            const config = QUADRANT_CONFIGS[quadrantKey];
            return (
              <SortableContext
                key={config.key}
                items={quadrants[config.key].map((t: any) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <Quadrant
                  todos={quadrants[config.key]}
                  onDrop={() => {}}
                  quadrant={config.key}
                  config={config}
                />
              </SortableContext>
            );
          })}
        </div>
      </div>
    </div>
  );
}
