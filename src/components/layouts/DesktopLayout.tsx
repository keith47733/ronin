"use client";

import React from "react";
import { TodoList } from "@/components/TodoList";
import { Quadrant } from "@/components/Quadrant";
import { useTodo } from "@/context/TodoContext";
import Image from "next/image";

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

  return (
    <div className="flex flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel - Inbox */}
      <div className="w-1/3 h-full p-3">
        <TodoList />
      </div>

      {/* Right Panel - Quadrants */}
      <div className="w-2/3 h-full p-3">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full relative">
          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-black -translate-x-1/2"></div>

          {/* Horizontal Divider */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black -translate-y-1/2"></div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Image
              src="/ronin.png"
              alt="Ronin Logo"
              width={90}
              height={90}
              className="opacity-90 blur-[15%] filter brightness-0 rounded-md"
            />
          </div>

          {/* Quadrants */}
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
