"use client";

import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Quadrant } from "./Quadrant";

/**
 * TodoList Component
 *
 * A core component that serves as the entry point for new tasks in the application.
 * It provides a simple interface for adding new todos before they are organized into
 * the Eisenhower Matrix quadrants.
 *
 * Layout Behavior:
 * - Desktop (lg breakpoint and above):
 *   - Fixed height with internal scrolling
 *   - Form at the top
 *   - Scrollable todo list below
 *   - Minimum height to prevent collapse
 *
 * - Mobile:
 *   - Natural height based on content
 *   - Form at the top
 *   - Expanding todo list below
 *   - No scrolling constraints
 *
 * Visual Features:
 * - Clean and minimal design
 * - Consistent spacing
 * - Focus states for inputs
 * - Hover effects for buttons
 *
 * Interaction Features:
 * - Form submission with Enter key
 * - Input validation
 * - Focus management
 * - Responsive to screen size
 */
export function TodoList() {
  // State for managing the new todo input field
  const [newTodo, setNewTodo] = useState("");

  // Access todo context to get quadrants and addTodo function
  const { quadrants, addTodo, moveTodo } = useTodo();

  // Get configuration for the inbox quadrant from constants
  const inboxConfig = QUADRANT_CONFIGS.inbox;

  /**
   * Handles the submission of a new todo
   * - Prevents default form submission
   * - Validates input (non-empty after trimming)
   * - Adds new todo to the context
   * - Clears the input field
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim(), 'inbox');
      setNewTodo("");
    }
  };

  return (
    // Main Container
    // - Flex column layout
    // - Full height on desktop
    // - Natural height on mobile
    <div className="h-full flex flex-col p-1">
      {/* Add Task Form Section
          - Fixed position at top
          - Full width input
          - Responsive button
          - Clear visual hierarchy */}
      <div className="shrink-0 pt-[2px] pb-[2px]">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex space-x-4 items-center pb-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="border border-gray-400 flex-1 px-4 py-2 pb-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-slate-700"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-base font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Task
            </button>
          </div>
          <div className="border-b border-gray-400 bg-white/50 mt-2" />
        </form>
      </div>

      {/* Inbox Quadrant Section
          - Scrollable on desktop
          - Expanding on mobile
          - Consistent styling with other quadrants
          - Drag and drop support */}
      <div className="flex-1 min-h-0 mt-2">
        <SortableContext
          items={quadrants.inbox.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <Quadrant
            todos={quadrants.inbox}
            onDrop={(data) => moveTodo(data.todo, data.fromQuadrant, "inbox")}
            quadrant="inbox"
            config={inboxConfig}
          />
        </SortableContext>
      </div>
    </div>
  );
}
