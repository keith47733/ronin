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

/**
 * DesktopLayout Component
 *
 * A dedicated layout component for desktop view that implements:
 * - Fixed height layout with internal scrolling
 * - Split screen with inbox and quadrants
 * - Grid-based quadrant arrangement
 * - Visual dividers and logo overlay
 */
export function DesktopLayout() {
  const { quadrants } = useTodo();

  return (
    <div className="flex flex-row h-[calc(100vh-4rem)] overflow-hidden p-2 gap-2">
      {/* Left Panel - Inbox */}
      <div className="w-1/3 h-full">
        <div className="h-full border border-gray-400 rounded-lg p-2">
          <TodoList />
        </div>
      </div>

      {/* Right Panel - Quadrants */}
      <div className="w-2/3 h-full">
        <div className="h-full relative">
          {/* Grid Container */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full p-3">
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

          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-gray-400 -translate-x-1/2 pointer-events-none"></div>

          {/* Horizontal Divider */}
          <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-gray-400 -translate-y-1/2 z-10 pointer-events-none"></div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <Image
              src="/katana.png"
              alt="Katana Icon"
              width={72}
              height={72}
              className="opacity-100 blur-[15%] filter brightness-0 rounded-md transition-transform duration-300 hover:scale-[1.25] rotate-[30deg]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
