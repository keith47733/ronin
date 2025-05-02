"use client";

import React, { useMemo } from "react";
import { TodoList } from "@/components/TodoList";
import { Quadrant } from "@/components/Quadrant";
import { useTodo } from "@/context/TodoContext";
import Image from "next/image";
import { QuadrantKey } from "@/types/todo";

interface QuadrantConfig {
  title: string;
  subtitle: string;
  quadrant: QuadrantKey;
  bgColor: string;
}

const QUADRANT_CONFIG: QuadrantConfig[] = [
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
  const { quadrants, moveTodo } = useTodo();

  const renderQuadrants = useMemo(() => {
    return QUADRANT_CONFIG.map((config) => (
      <Quadrant
        key={config.quadrant}
        title={config.title}
        subtitle={config.subtitle}
        todos={quadrants[config.quadrant]}
        onDrop={(data) => moveTodo(data.todo, data.fromQuadrant, config.quadrant)}
        quadrant={config.quadrant}
        bgColor={config.bgColor}
      />
    ));
  }, [quadrants, moveTodo]);

  return (
    <div className="flex flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel - Inbox */}
      <div className="w-1/3 h-full p-3">
        <TodoList />
      </div>

      {/* Right Panel - Quadrants */}
      <div className="w-2/3 h-full p-3">
        <div className="h-full relative">
          {/* Grid Container */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
            {renderQuadrants}
          </div>

          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black/25 -translate-x-1/2 pointer-events-none"></div>

          {/* Horizontal Divider */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/25 -translate-y-1/2 z-10 pointer-events-none"></div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Image
              src="/ronin.png"
              alt="Ronin Logo"
              width={90}
              height={90}
              className="opacity-90 blur-[15%] filter brightness-0 rounded-md transition-transform duration-300 hover:scale-[1.35]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
