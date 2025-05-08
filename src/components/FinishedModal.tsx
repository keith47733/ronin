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
import { DndListView } from "./DndListView";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";
import { useTodo } from "@/context/TodoContext";

/**
 * FinishedModal
 *
 * - Shows a modal with a scrollable list of finished (completed) tasks
 * - Allows restoring tasks to active state
 * - Integrates with drag-and-drop (DnD) for moving tasks out
 * - Closes automatically if all finished tasks are restored
 * - Uses quadrant config for consistent styling
 */
interface FinishedModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal is closed
  finished: Todo[]; // List of completed tasks
}

// Use the finished config for modal colors and styles
const finishedConfig = QUADRANT_CONFIGS.finished;

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

  // Close the modal when the last finished todo is restored
  const handleRestore = () => {
    if (finished.length === 1) {
      onClose();
    }
  };

  // Responsive: center modal on mobile, right-align on desktop
  const isDesktop = typeof window !== "undefined" ? window.innerWidth >= 1024 : true;

  // Add robust pendingMove handling for finished todos
  // (Removed useEffect that reorders finished list)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={finishedConfig.title}
      subtitle={finishedConfig.subtitle}
      className={`w-[90%] lg:w-1/3 rounded-lg ${finishedConfig.bgColor}`}
      headerClassName={`${finishedConfig.headerBgColor} border-b border-gray-200 rounded-t-lg`}
      backgroundClassName={finishedConfig.bgColor}
      style={
        isDesktop
          ? {
              position: "fixed",
              top: "6rem",
              right: "2rem",
              transform: "none",
              zIndex: 1001,
            }
          : {
              position: "fixed",
              top: "6rem",
              left: "50%",
              right: "auto",
              transform: "translateX(-50%)",
              zIndex: 1001,
            }
      }
    >
      <div>
        <div className={`${finishedConfig.bgColor} rounded-b-lg relative overflow-y-auto`} style={{minHeight: 80}}>
          <DndListView
            items={finished}
            onReorder={() => {}}
            renderItem={(todo) => (
              <div className="w-full scroll-mt-1 scroll-mb-1">
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  quadrant="finished"
                  onDragStart={() => () => {}}
                  onDragEnd={() => {}}
                  onRestore={handleRestore}
                  onDrop={() => {}}
                  onDragOver={() => {}}
                  onDragLeave={() => {}}
                  onDelete={() => {}}
                  onUpdateText={() => {}}
                />
              </div>
            )}
            listClassName="gap-1 max-h-[calc(50vh-50px)] lg:max-h-[calc(100vh-12rem-50px)] scrollbar-none"
            gradientColor={finishedConfig.gradientColor}
            quadrantId="finished"
          />
          {finished.length === 0 && (
            <div className="text-gray-500 text-sm font-karla self-start mt-2 mb-4 px-4">
              No finished tasks yet...
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
