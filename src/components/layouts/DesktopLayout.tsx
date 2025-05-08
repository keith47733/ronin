"use client";

import React from "react";
import { TodoList } from "@/components/TodoList";
import { Quadrant } from "@/components/Quadrant";
import { useTodo } from "@/context/TodoContext";
import Image from "next/image";
import { QuadrantKey } from "@/types/todo";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";
import { Todo } from "@/types/todo";

/**
 * DesktopLayout Component
 * 
 * A sophisticated layout component designed for desktop view that implements
 * the Eisenhower Matrix methodology in a split-screen interface.
 * 
 * Key Features:
 * 1. Layout Structure:
 *    - Split screen with 1/3 for inbox and 2/3 for quadrants
 *    - Fixed height with internal scrolling for each section
 *    - Grid-based quadrant arrangement (2x2)
 * 
 * 2. Visual Elements:
 *    - Centered katana logo with hover effects
 *    - Vertical and horizontal dividers
 *    - Distinct background colors for each quadrant
 * 
 * 3. Drag and Drop:
 *    - SortableContext for each quadrant
 *    - Vertical list sorting strategy
 *    - Smooth drag and drop animations
 * 
 * 4. Responsive Design:
 *    - Maintains aspect ratio and proportions
 *    - Preserves visual hierarchy
 *    - Optimized for larger screens
 * 
 * Component Structure:
 * DesktopLayout
 * ├── Left Panel (Inbox)
 * │   └── TodoList
 * └── Right Panel (Quadrants)
 *     ├── Grid Container
 *     │   ├── Quadrant (DO NOW)
 *     │   ├── Quadrant (SCHEDULE)
 *     │   ├── Quadrant (DELEGATE)
 *     │   └── Quadrant (DELETE)
 *     ├── Dividers
 *     └── Logo Overlay
 */
export function DesktopLayout() {
  const { quadrants } = useTodo();

  return (
    <div className="flex flex-row h-[calc(100vh-80px)] overflow-hidden p-2 gap-2">
      {/* Left Panel - Inbox */}
      <div className="w-1/3 h-full">
        <div className="h-full relative border border-gray-400 rounded-lg p-2"> 
          <TodoList />
            {/* Centered Ronin Logo in Right Panel */}
            <div className="absolute inset-0 flex items-center justify-center z-[2000] pointer-events-none pt-[20%] p-[5%]">
              <Image
                  src="/ronin-face.png"
                  alt="Ronin Face"
                  width={550}
                  height={700}
                  style={{ width: '80%', height: 'auto', opacity: 0.025 }}
                  className="blur-xs"
                  priority
                />
            </div>
        </div>
      </div>

      {/* Right Panel - Quadrants */}
      <div className="w-2/3 h-full">
        <div className="h-full relative border border-gray-400 rounded-lg p-2">
          {/* Grid Container */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
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

          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-gray-400 -translate-x-1/2 pointer-events-none"></div>

          {/* Horizontal Divider */}
          <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-gray-400 -translate-y-1/2 z-10 pointer-events-none"></div>
        
          {/* Centered Katana Logo in Left Panel */}
          <div className="absolute inset-0 flex items-center justify-center z-[2000] pointer-events-none p-[2%]">
            <Image
              src="/katana.png"
              alt="Katana Icon"
              width={580}
              height={1300}
              style={{ width: 'auto', height: '98%', opacity: 0.02 }}
              className="rotate-[30deg] blur-xs"
              priority
            />
          </div>   
        </div>
      </div>
    </div>  
  );
}
