/**
 * FinishedModal Component
 *
 * A modal component that displays completed tasks in a scrollable list. It provides
 * functionality to view, restore, and manage finished tasks.
 *
 * Key Features:
 * 1. Task Management:
 *    - Displays all completed tasks in a scrollable list
 *    - Supports drag and drop operations
 *    - Auto-closes when no finished tasks remain
 *
 * 2. User Interaction:
 *    - Click outside to close
 *    - Escape key to close
 *    - Close button in header
 *
 * 3. Visual Design:
 *    - Semi-transparent backdrop with blur effect
 *    - Fixed positioning in top-right corner
 *    - Responsive sizing with max height constraints
 *
 * 4. Accessibility:
 *    - Keyboard navigation support
 *    - Clear visual hierarchy
 *    - Proper ARIA attributes
 *
 * @component
 * @param {FinishedModalProps} props - Component properties
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Todo[]} props.finished - List of completed tasks
 */
"use client";

import { useEffect } from "react";
import { Modal } from "./Modal";
import TodoItem from "./TodoItem";
import { Todo } from "@/types/todo";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface FinishedModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal is closed
  finished: Todo[]; // List of completed tasks
}

export default function FinishedModal({
  isOpen,
  onClose,
  finished,
}: FinishedModalProps) {
  /**
   * Initialize drag and drop functionality
   * - Sets up handlers for drag and drop operations
   * - Note: The finished modal doesn't handle drops directly
   *   as the quadrants handle moving todos from the finished list
   */
  const { handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragAndDrop({
      onDrop: () => {
        // The finished modal doesn't need to handle drops
        // The quadrants will handle moving todos from the finished list
        return;
      },
    });

  // Close the modal when the last todo is restored
  const handleRestore = () => {
    if (finished.length === 1) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finished Tasks"
      className="w-[90%] lg:w-1/3 rounded-lg"
      style={{
        position: "fixed",
        top: "6rem",
        right: "2rem",
        transform: "none",
        zIndex: 51, // Ensure modal is above animated items
      }}
    >
      <div
        className="p-4 overflow-y-auto max-h-[calc(100vh-8rem)]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          {finished.length === 0 ? (
            <div className="text-gray-500 text-sm font-karla self-start">
              No finished tasks yet...
            </div>
          ) : (
            finished.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                quadrant="finished"
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onRestore={handleRestore}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
