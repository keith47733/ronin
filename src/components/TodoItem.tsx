"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Todo, QuadrantKey } from "@/types/todo";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import {
  CalendarIcon,
  MessageSquareIcon,
  HourglassIcon,
  TrashIcon,
  Circle,
  CircleCheck,
  CircleCheckBig,
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { format, isToday, isBefore } from "date-fns";

/**
 * Props interface for the TodoItem component
 */
interface TodoItemProps {
  todo: Todo; // The todo item to display
  quadrant: QuadrantKey; // The quadrant this todo belongs to
  onDragStart: (
    todo: Todo,
    quadrant: QuadrantKey
  ) => (e: React.DragEvent<HTMLDivElement>) => void; // Handler for drag start events
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onRestore?: (id: string) => void; // Optional handler for restore events
}

/**
 * TodoItem Component
 *
 * This component represents a single todo item in the application. It provides a rich set of features
 * for managing individual tasks, including editing, completion tracking, and metadata management.
 *
 * Key Features:
 * 1. Text Editing: Double-click to edit the todo text
 * 2. Completion Status: Toggle completion with a checkbox
 * 3. Due Date Management: Set and display due dates
 * 4. Note Management: Add and view notes for the todo
 * 5. Waiting Status: Mark tasks as waiting/blocked
 * 6. Delete/Restore: Delete tasks or restore from finished state
 * 7. Drag and Drop: Reorder tasks within and between quadrants
 * 8. Visual Feedback: Fade-in animation and hover effects
 * 9. Accessibility: ARIA labels and keyboard navigation
 *
 * @component
 * @param {TodoItemProps} props - Component properties
 * @param {Todo} props.todo - The todo item data
 * @param {QuadrantKey} props.quadrant - The quadrant this todo belongs to
 * @param {Function} props.onDragStart - Handler for drag start events
 */
export default function TodoItem({
  todo,
  quadrant,
  onDragStart,
  onDragEnd,
  onRestore,
}: TodoItemProps) {
  // Context hooks for state management
  // These provide access to the global todo state and actions
  const {
    toggleTodo,
    permanentlyDeleteTodo,
    restoreTodo,
    updateTodoText,
    toggleWaiting,
  } = useTodo();

  // Modal context for managing popup dialogs
  const { openModal } = useModal();

  // Local state management
  const [isEditing, setIsEditing] = useState(false); // Controls text editing mode
  const [editedText, setEditedText] = useState(todo.text); // Buffer for edited text
  const [opacity, setOpacity] = useState(0); // Controls fade-in animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});
  const itemRef = useRef<HTMLDivElement>(null);
  const { finishedButtonRef } = useAnimation();

  // Memoize the intersection observer callback
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setOpacity(1);
      }
    });
  }, []);

  // Memoize the threshold array
  const observerThreshold = useMemo(
    () => Array.from({ length: 100 }, (_, i) => i / 100),
    []
  );

  // Set up intersection observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: itemRef.current?.closest(".overflow-y-auto"),
      threshold: observerThreshold,
    });

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [observerCallback, observerThreshold]);

  // Memoize event handlers
  const handleTextClick = useCallback(() => {
    if (quadrant !== "finished") {
      setIsEditing(true);
    }
  }, [quadrant]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(e.target.value);
  }, []);

  const handleTextBlur = useCallback(() => {
    if (editedText.trim()) {
      updateTodoText(todo.id, editedText.trim());
    }
    setIsEditing(false);
  }, [editedText, todo.id, updateTodoText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextBlur();
    } else if (e.key === "Escape") {
      setEditedText(todo.text);
      setIsEditing(false);
    }
  }, [handleTextBlur, todo.text]);

  /**
   * Opens the due date modal for setting/updating the todo's due date
   * Calculates the modal position based on the trigger element
   * @param {React.MouseEvent} e - The click event
   */
  const handleDueDateClick = (e: React.MouseEvent) => {
    if (quadrant === "finished") return;
    const rect = e.currentTarget.getBoundingClientRect();
    openModal("dueDate", {
      todoId: todo.id,
      quadrant,
      initialDate: todo.dueDate,
      triggerPosition: { x: rect.left + rect.width / 2, y: rect.top },
    });
  };

  /**
   * Opens the note modal for adding/editing the todo's note
   */
  const handleNoteClick = () => {
    if (quadrant === "finished") return;
    openModal("note", {
      todoId: todo.id,
      quadrant,
      initialNote: todo.note,
    });
  };

  // Function to get the target quadrant element
  const getQuadrantElement = (quadrantKey: QuadrantKey) => {
    return document.querySelector(`[data-quadrant="${quadrantKey}"]`);
  };

  // Function to calculate animation path
  const calculateAnimationPath = (
    isFinishing: boolean
  ): React.CSSProperties => {
    if (!itemRef.current || !finishedButtonRef.current) {
      return {
        transform: "none",
        transition: "none",
        position: "relative",
        zIndex: 0,
        pointerEvents: "auto" as React.CSSProperties["pointerEvents"],
      };
    }

    const itemRect = itemRef.current.getBoundingClientRect();
    let targetRect: DOMRect;

    if (isFinishing) {
      // When finishing, animate to the FINISHED button
      targetRect = finishedButtonRef.current.getBoundingClientRect();
    } else {
      // When restoring, animate to the target quadrant
      const targetQuadrant = getQuadrantElement(todo.quadrant);
      if (!targetQuadrant) {
        return {
          transform: "none",
          transition: "none",
          position: "relative",
          zIndex: 0,
          pointerEvents: "auto" as React.CSSProperties["pointerEvents"],
        };
      }
      targetRect = targetQuadrant.getBoundingClientRect();
    }

    // Calculate the transform needed to move from current position to target
    const translateX = targetRect.left - itemRect.left;
    const translateY = targetRect.top - itemRect.top;

    // Calculate scale factor (shrink to 0.2 when finishing, grow from 0.2 when restoring)
    const scale = isFinishing ? 0.2 : 1;

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transition: "all 0.8s ease-in-out",
      position: "fixed",
      zIndex: 10,
      pointerEvents: "none" as React.CSSProperties["pointerEvents"],
      maxWidth: "33vw",
    };
  };

  // Function to check if we're in mobile mode
  const isMobileMode = () => {
    return window.innerWidth < 1024; // lg breakpoint
  };

  // Handle finish animation
  const handleFinish = () => {
    if (isMobileMode()) {
      toggleTodo(todo.id);
      return;
    }

    setIsAnimating(true);
    setAnimationStyle(calculateAnimationPath(true));

    // After animation completes, toggle the todo
    setTimeout(() => {
      toggleTodo(todo.id);
      setIsAnimating(false);
      setAnimationStyle({});
    }, 800);
  };

  // Handle restore animation
  const handleRestore = () => {
    if (isMobileMode()) {
      restoreTodo(todo.id);
      onRestore?.(todo.id);
      return;
    }

    // Start the animation first
    setIsAnimating(true);
    setAnimationStyle(calculateAnimationPath(false));

    // After a short delay, restore the todo
    setTimeout(() => {
      restoreTodo(todo.id);
      onRestore?.(todo.id);

      // Clean up animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationStyle({});
      }, 800);
    }, 50);
  };

  return (
    <>
      {/* Main Todo Item Container */}
      <div
        ref={itemRef}
        className={`w-full sm:w-[90%] rounded-lg shadow-soft border border-gray-200 p-2 cursor-move relative
          transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:border-gray-300
          ${quadrant === "finished" ? "bg-gray-50" : "bg-white"}
          ${isAnimating ? "pointer-events-none" : ""}
          todo-item transition-opacity duration-300 ease-in-out`}
        style={{
          opacity,
          ...animationStyle,
        }}
        draggable={!isAnimating}
        onDragStart={onDragStart(todo, quadrant)}
        onDragEnd={onDragEnd}
        role="listitem"
        aria-label={`Task: ${todo.text}`}
      >
        {/* Strikethrough line for finished todos */}
        {quadrant === "finished" && (
          <div className="absolute top-1/2 left-[2.5rem] right-[-0.5rem] h-[2px] bg-gray-400 -translate-y-1/2 z-10" />
        )}

        {/* Todo Content */}
        <div className="flex items-center gap-2">
          {/* Checkbox/Undo */}
          {quadrant === "finished" ? (
            <button
              onClick={handleRestore}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Restore task"
            >
              <CircleCheckBig className="w-4 h-4 text-green-700 drop-shadow-[0_0_20px_rgba(21,128,61,0.8)]" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label={
                todo.completed ? "Mark as incomplete" : "Mark as complete"
              }
            >
              {todo.completed ? (
                <CircleCheck className="w-4 h-4 text-green-700 drop-shadow-[0_0_20px_rgba(21,128,61,0.8)]" />
              ) : (
                <Circle className="w-4 h-4 text-green-700 drop-shadow-[0_0_20px_rgba(21,128,61,0.8)]" />
              )}
            </button>
          )}

          {/* Task Name Input */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            ) : (
              <div
                onClick={handleTextClick}
                className={`block w-full px-2 py-1 cursor-text truncate
                  ${todo.completed && quadrant !== "finished"
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                  } ${
                    quadrant !== "finished"
                      ? "hover:bg-primary-50/50 hover:backdrop-blur-sm hover:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      : ""
                  } transition-all duration-200 rounded-md`}
              >
                {todo.text}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Calendar Icon */}
            {quadrant === "finished" ? (
              <div
                className={`p-1 rounded-full ${
                  todo.dueDate
                    ? "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]"
                    : "text-gray-400"
                }`}
              >
                <CalendarIcon className="h-5 w-5" />
              </div>
            ) : (
              <>
                {todo.dueDate ? (
                  <Tooltip
                    content={format(
                      new Date(todo.dueDate),
                      "EEEE MMMM d, yyyy"
                    )}
                    bgColor={
                      isToday(new Date(todo.dueDate))
                        ? "bg-green-300"
                        : isBefore(new Date(todo.dueDate), new Date())
                        ? "bg-red-300"
                        : "bg-blue-300"
                    }
                    textColor="text-white"
                  >
                    <button onClick={handleDueDateClick} className="p-1 rounded-full hover:bg-blue-50 transition-colors">
                      <CalendarIcon
                        className={`h-5 w-5 ${
                          isToday(new Date(todo.dueDate))
                            ? "text-green-300 drop-shadow-[0_0_20px_rgba(134,239,172,0.8)]"
                            : isBefore(new Date(todo.dueDate), new Date())
                            ? "text-red-300 drop-shadow-[0_0_20px_rgba(252,165,165,0.8)]"
                            : "text-blue-300 drop-shadow-[0_0_20px_rgba(147,197,253,0.8)]"
                        }`}
                      />
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={handleDueDateClick}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Set due date"
                  >
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </>
            )}

            {/* Note Icon */}
            {quadrant === "finished" ? (
              <div
                className={`p-1 rounded-full ${
                  todo.note
                    ? "text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.5)]"
                    : "text-gray-400"
                }`}
              >
                <MessageSquareIcon className="h-5 w-5" />
              </div>
            ) : (
              <>
                {todo.note ? (
                  <Tooltip
                    content={todo.note}
                    bgColor="bg-purple-300"
                    textColor="text-white"
                  >
                    <button onClick={handleNoteClick} className="p-1 rounded-full hover:bg-purple-50 transition-colors">
                      <MessageSquareIcon className="h-5 w-5 text-purple-300 drop-shadow-[0_0_20px_rgba(216,180,254,0.8)]" />
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={handleNoteClick}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Add note"
                  >
                    <MessageSquareIcon className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </>
            )}

            {/* Hourglass Icon */}
            {quadrant === "finished" ? (
              <div
                className={`p-1 rounded-full ${
                  todo.isWaiting
                    ? "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]"
                    : "text-gray-400"
                }`}
              >
                <HourglassIcon className="h-5 w-5" />
              </div>
            ) : (
              <>
                {todo.isWaiting ? (
                  <Tooltip
                    content="WAITING"
                    bgColor="bg-orange-300"
                    textColor="text-white"
                  >
                    <button
                      onClick={() => toggleWaiting(todo.id)}
                      className="p-1 rounded-full hover:bg-orange-50 transition-colors"
                    >
                      <HourglassIcon className="h-5 w-5 text-orange-300 drop-shadow-[0_0_20px_rgba(253,186,116,0.8)]" />
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => toggleWaiting(todo.id)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Mark as waiting"
                  >
                    <HourglassIcon className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </>
            )}

            {/* Delete Button */}
            {quadrant === "finished" ? (
              <button
                onClick={() => permanentlyDeleteTodo(todo.id)}
                className="p-1 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Permanently delete task"
              >
                <TrashIcon className="h-5 w-5 text-red-300 drop-shadow-[0_0_20px_rgba(252,165,165,0.8)]" />
              </button>
            ) : (
              <button
                onClick={() => permanentlyDeleteTodo(todo.id)}
                className="p-1 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Delete task"
              >
                <TrashIcon className="h-5 w-5 text-red-300 drop-shadow-[0_0_20px_rgba(252,165,165,0.8)]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
