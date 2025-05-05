"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
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
  Grip,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { format } from "date-fns";

/**
 * Props interface for the TodoItem component
 */
interface TodoItemProps {
  todo: Todo;
  quadrant: QuadrantKey;
  onDragStart: (todo: Todo) => (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

// Add these styles near the top of the file, after the imports
const iconStyles = {
  base: "p-1.5 rounded-full transition-all duration-300 border border-transparent flex items-center justify-center",
  active: {
    calendar: "text-blue-500 bg-blue-100/80 hover:bg-blue-200/80 hover:border-blue-300 transform hover:scale-[1.25]",
    note: "text-purple-500 bg-purple-100/80 hover:bg-purple-200/80 hover:border-purple-300 transform hover:scale-[1.25]",
    waiting: "text-orange-500 bg-orange-100/80 hover:bg-orange-200/80 hover:border-orange-300 transform hover:scale-[1.25]",
    check: "text-green-600 transform hover:scale-[1.25]",
    delete: "text-red-500 transform hover:scale-[1.25]",
  },
  inactive: "text-gray-400 hover:bg-gray-100/80 transform hover:scale-[1.25]",
  inactiveWithScale: "text-gray-400 hover:bg-gray-100/80 transform hover:scale-[1.25]",
  glow: {
    calendar: "drop-shadow-[0_0_4px_rgba(59,130,246,0.2)]",
    note: "drop-shadow-[0_0_4px_rgba(168,85,247,0.2)]",
    waiting: "drop-shadow-[0_0_4px_rgba(249,115,22,0.2)]",
  },
  tooltip: {
    calendar: "bg-blue-50 text-blue-800 [&>div:last-child]:border-t-blue-50 [&>div:last-child]:bg-blue-50",
    note: "bg-purple-50 text-purple-800 [&>div:last-child]:border-t-purple-50 [&>div:last-child]:bg-purple-50",
    waiting: "bg-orange-50 text-orange-800 [&>div:last-child]:border-t-orange-50 [&>div:last-child]:bg-orange-50",
  },
};

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
  onDrop,
  onDragOver,
  onDragLeave,
  onDelete,
  onUpdateText,
}: TodoItemProps) {
  // Context hooks for state management
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
  const [isDragging, setIsDragging] = useState(false);
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
    if (todo.completed) return;
    setIsEditing(true);
  }, [todo.completed]);

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
    isFinishing: boolean,
    isFromModal: boolean = false
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
      // When finishing, animate to the center of the FINISHED button
      targetRect = finishedButtonRef.current.getBoundingClientRect();
      // Calculate center position of the button
      const centerX = targetRect.left + targetRect.width / 2;
      const centerY = targetRect.top + targetRect.height / 2;
      
      // Calculate the transform needed to move to the center
      const translateX = centerX - (itemRect.left + itemRect.width / 2);
      const translateY = centerY - (itemRect.top + itemRect.height / 2);

      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(0)`,
        transition: "all 0.5s ease-in-out",
        position: "fixed",
        zIndex: 10,
        pointerEvents: "none" as React.CSSProperties["pointerEvents"],
        maxWidth: "33vw",
        opacity: 0,
      };
    } else {
      // When restoring, animate from the center of the finished card to the target quadrant
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
      
      // Calculate center position of the finished card
      const centerX = itemRect.left + itemRect.width / 2;
      const centerY = itemRect.top + itemRect.height / 2;
      
      // Calculate the transform needed to move from center to top-left of target
      const translateX = targetRect.left - centerX;
      const translateY = targetRect.top - centerY;

      // If restoring from modal, use a simpler animation
      if (isFromModal) {
        return {
          transform: "scale(0)",
          transition: "all 0.3s ease-in-out",
          position: "relative",
          zIndex: 0,
          pointerEvents: "auto" as React.CSSProperties["pointerEvents"],
          opacity: 0,
        };
      }

      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(1)`,
        transition: "all 0.5s ease-in-out",
        position: "fixed",
        zIndex: 10,
        pointerEvents: "none" as React.CSSProperties["pointerEvents"],
        maxWidth: "33vw",
        opacity: 1,
      };
    }
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
    
    // Start the scale-to-right and fade animation
    setAnimationStyle({
      transform: 'translateX(50%) scaleX(0)',
      opacity: 0,
      transformOrigin: 'right center',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    });

    // After the animation completes, toggle the todo
    setTimeout(() => {
      toggleTodo(todo.id);
      setIsAnimating(false);
      setAnimationStyle({});
    }, 500);
  };

  // Handle restore animation
  const handleRestore = () => {
    if (isMobileMode()) {
      restoreTodo(todo.id);
      return;
    }

    setIsAnimating(true);
    
    // Start the scale-to-left and fade animation
    setAnimationStyle({
      transform: 'translateX(-50%) scaleX(0)',
      opacity: 0,
      transformOrigin: 'left center',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    });

    // After the animation completes, restore the todo
    setTimeout(() => {
      restoreTodo(todo.id);
      setIsAnimating(false);
      setAnimationStyle({});
    }, 500);
  };

  // Handle delete animation
  const handleDelete = () => {
    if (isMobileMode()) {
      permanentlyDeleteTodo(todo.id);
      return;
    }

    setIsAnimating(true);
    
    // Start the scale-down animation
    setAnimationStyle({
      transform: "scale(0)",
      opacity: 0,
      transition: "all 0.3s ease-in-out",
    });

    // After the scale-down completes, delete the todo
    setTimeout(() => {
      permanentlyDeleteTodo(todo.id);
      setIsAnimating(false);
      setAnimationStyle({});
    }, 300);
  };

  // Custom drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(todo)(e);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  return (
    <div
      ref={itemRef}
      className={`group flex items-center gap-2 py-2.5 px-3 rounded-lg shadow-sm transition-all duration-200 w-full max-w-3xl ${
        quadrant === "finished"
          ? "bg-red-100/30 hover:bg-red-200/40 border border-red-200/50"
          : "bg-white hover:bg-gray-100 border border-gray-100"
      } ${
        (todo.dueDate || todo.note || todo.isWaiting) && !todo.completed && quadrant !== "finished"
          ? ""
          : ""
      } ${
        todo.isWaiting ? "opacity-70" : ""
      } ${isAnimating ? "pointer-events-none" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
      style={{ opacity, ...animationStyle }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Grab Handle */}
      {!todo.completed && (
        <div 
          className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing"
          draggable={!todo.completed}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Grip className="w-5 h-5" />
        </div>
      )}

      {/* Checkbox/Undo */}
      {todo.completed ? (
        <button
          onClick={handleRestore}
          className="p-1.5 rounded-full border border-transparent transition-all duration-300 flex-shrink-0 transform hover:scale-[1.25]"
          aria-label="Restore task"
        >
          <CircleCheckBig className="w-4 h-4 text-green-700" />
        </button>
      ) : (
        <button
          onClick={handleFinish}
          className={`${iconStyles.base} ${iconStyles.active.check}`}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.completed ? (
            <CircleCheck className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Task Name Input */}
      <div className="flex-1 min-w-0 pointer-events-none">
        {isEditing ? (
          <input
            type="text"
            value={editedText}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-2.5 py-1.5 text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 pointer-events-auto"
            autoFocus
          />
        ) : (
          <div
            onClick={handleTextClick}
            className={`block w-full px-2.5 py-1.5 cursor-default truncate
              ${todo.completed ? "text-gray-400" : "text-gray-900"} 
              transition-all duration-200 rounded-md ${!todo.completed ? "border border-transparent hover:border-gray-300" : ""} pointer-events-auto`}
          >
            {todo.text}
          </div>
        )}
      </div>

      {/* Action Icons */}
      <div className={`flex items-center gap-1 flex-shrink-0 ${isDragging ? "pointer-events-none" : ""}`}>
        {quadrant === "finished" ? (
          <>
            <div className={`${iconStyles.base} ${todo.dueDate ? "text-blue-400" : "text-gray-400"}`}>
              <CalendarIcon size={16} />
            </div>
            <div className={`${iconStyles.base} ${todo.note ? "text-purple-400" : "text-gray-400"}`}>
              <MessageSquareIcon size={16} />
            </div>
            <div className={`${iconStyles.base} ${todo.isWaiting ? "text-orange-400" : "text-gray-400"}`}>
              <HourglassIcon size={16} />
            </div>
            <button
              onClick={handleDelete}
              className={`${iconStyles.base} ${iconStyles.active.delete} hover:scale-120`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {todo.dueDate && !todo.completed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleDueDateClick}
                      className={`${iconStyles.base} ${
                        todo.dueDate ? iconStyles.active.calendar : iconStyles.inactive
                      } ${todo.dueDate ? iconStyles.glow.calendar : ""}`}
                      disabled={todo.completed}
                    >
                      <CalendarIcon size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className={`min-w-[120px] text-center ${iconStyles.tooltip.calendar}`}>
                    {format(todo.dueDate, "MMM d, yyyy")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={handleDueDateClick}
                className={`${iconStyles.base} ${
                  todo.dueDate ? iconStyles.active.calendar : iconStyles.inactiveWithScale
                } ${todo.dueDate ? iconStyles.glow.calendar : ""}`}
                disabled={todo.completed}
              >
                <CalendarIcon size={16} />
              </button>
            )}

            {todo.note && !todo.completed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleNoteClick}
                      className={`${iconStyles.base} ${
                        todo.note ? iconStyles.active.note : iconStyles.inactive
                      } ${todo.note ? iconStyles.glow.note : ""}`}
                      disabled={todo.completed}
                    >
                      <MessageSquareIcon size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className={`min-w-[200px] max-w-[300px] whitespace-pre-wrap text-left ${iconStyles.tooltip.note}`}>
                    {todo.note}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={handleNoteClick}
                className={`${iconStyles.base} ${
                  todo.note ? iconStyles.active.note : iconStyles.inactiveWithScale
                } ${todo.note ? iconStyles.glow.note : ""}`}
                disabled={todo.completed}
              >
                <MessageSquareIcon size={16} />
              </button>
            )}

            {todo.isWaiting && !todo.completed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleWaiting(todo.id)}
                      className={`${iconStyles.base} ${
                        todo.isWaiting ? iconStyles.active.waiting : iconStyles.inactive
                      } ${todo.isWaiting ? iconStyles.glow.waiting : ""}`}
                      disabled={todo.completed}
                    >
                      <HourglassIcon size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className={`min-w-[100px] text-center ${iconStyles.tooltip.waiting}`}>
                    Waiting...
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={() => toggleWaiting(todo.id)}
                className={`${iconStyles.base} ${
                  todo.isWaiting ? iconStyles.active.waiting : iconStyles.inactiveWithScale
                } ${todo.isWaiting ? iconStyles.glow.waiting : ""}`}
                disabled={todo.completed}
              >
                <HourglassIcon size={16} />
              </button>
            )}

            <button
              onClick={handleDelete}
              className={`${iconStyles.base} ${iconStyles.active.delete} hover:scale-120`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
