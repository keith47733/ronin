"use client";

import React, { useRef, useState, useEffect } from "react";
import { Todo, QuadrantKey } from "@/types/todo";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import {
  CalendarIcon,
  MessageSquareIcon,
  TrashIcon,
  Grip,
  Circle,
  CircleCheck,
  CircleCheckBig,
  HourglassIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { format } from "date-fns";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";
import { DraggableAttributes } from '@dnd-kit/core';
import { isToday, isTomorrow, isPast, differenceInCalendarDays } from "date-fns";

/**
 * TodoItem Component
 * 
 * A complex, interactive component that represents a single todo item in the application.
 * It serves as the primary interface for user interactions with individual tasks.
 * 
 * Component Flow:
 * 1. Initialization:
 *    - Sets up local state for editing, animations, and UI feedback
 *    - Configures intersection observer for fade-in animations
 *    - Initializes drag and drop handlers
 * 
 * 2. User Interactions:
 *    - Text editing (double-click to edit)
 *    - Completion toggling (with animations)
 *    - Due date management
 *    - Note management
 *    - Waiting status toggling
 *    - Drag and drop reordering
 * 
 * 3. Animation States:
 *    - Fade-in on mount
 *    - Completion animations
 *    - Restoration animations
 *    - Deletion animations
 *    - Drag and drop visual feedback
 * 
 * 4. Context Integration:
 *    - Uses TodoContext for state management
 *    - Uses ModalContext for popup dialogs
 *    - Uses AnimationContext for coordinated animations
 * 
 * 5. Accessibility:
 *    - ARIA labels for all interactive elements
 *    - Keyboard navigation support
 *    - Screen reader friendly structure
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
  grabHandleProps?: DraggableAttributes;
  onRestore?: () => void;
  isOverlay?: boolean;
}

/**
 * Animation and interaction styles for the component
 * Organized by interaction type and state
 */
const iconStyles = {
  base: "p-1 w-6 h-6 rounded-full inline-flex items-center justify-center transform transition-transform duration-200",
  active: {
    calendar: "text-blue-500 bg-blue-100/80 hover:bg-blue-200/80 hover:border-blue-300 transform hover:scale-125",
    note: "text-purple-500 bg-purple-100/80 hover:bg-purple-200/80 hover:border-purple-300 transform hover:scale-125",
    waiting: "text-orange-500 bg-orange-100/80 hover:bg-orange-200/80 hover:border-orange-300 transform hover:scale-125",
    check: "text-green-600 transform hover:scale-125",
    delete: "text-red-500 transform hover:scale-125",
  },
  inactive: "text-gray-400 hover:bg-gray-100/80 transform hover:scale-125",
  inactiveWithScale: "text-gray-400 hover:bg-gray-100/80 transform hover:scale-125",
  glow: {
    calendar: "drop-shadow-[0_0_2px_rgba(59,130,246,0.2)]",
    note: "drop-shadow-[0_0_2px_rgba(168,85,247,0.2)]",
    waiting: "drop-shadow-[0_0_2px_rgba(249,115,22,0.2)]",
  },
  tooltip: {
    calendar: "bg-blue-50 text-blue-800 [&>div:last-child]:border-t-blue-50 [&>div:last-child]:bg-blue-50",
    note: "bg-purple-50 text-purple-800 [&>div:last-child]:border-t-purple-50 [&>div:last-child]:bg-purple-50",
    waiting: "bg-orange-50 text-orange-800 [&>div:last-child]:border-t-orange-50 [&>div:last-child]:bg-orange-50",
  },
};

const dueDateColorStyles = {
  none:  "text-blue-500 bg-blue-100/80 hover:bg-blue-200/80",
  future: "text-blue-500 bg-blue-100/80 hover:bg-blue-200/80",
  tomorrow: "text-yellow-500 bg-yellow-100/80 hover:bg-yellow-200/80",
  today: "text-green-500 bg-green-100/80 hover:bg-green-200/80",
  overdue: "text-red-500 bg-red-100/80 hover:bg-red-200/80",
};

const dueDateTooltipStyles = {
  none:  "bg-blue-50 text-blue-800 border-t-blue-50",
  future: "bg-blue-50 text-blue-800 border-t-blue-50",
  tomorrow: "bg-yellow-50 text-yellow-800 border-t-yellow-50",
  today: "bg-green-50 text-green-800 border-t-green-50",
  overdue: "bg-red-50 text-red-800 border-t-red-50",
};

function getDueDateStatus(dueDate: Date | null) {
  if (!dueDate) return "none";
  if (isToday(dueDate)) return "today";
  if (isTomorrow(dueDate)) return "tomorrow";
  if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
  if (differenceInCalendarDays(dueDate, new Date()) >= 2) return "future";
  return "none";
}

/**
 * Helper to get quadrant config
 * @param {QuadrantKey} quadrant - The quadrant to get config for
 * @returns {Object} - The quadrant configuration object
 */
function getQuadrantConfig(quadrant: QuadrantKey) {
  return QUADRANT_CONFIGS[quadrant] || QUADRANT_CONFIGS.inbox;
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
  onDrop,
  onDragOver,
  onDragLeave,
  onDelete,
  onUpdateText,
  grabHandleProps,
  onRestore,
  isOverlay = false,
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
  const [isEditing, setIsEditing] = useState(false);              // Text editing state
  const [editedText, setEditedText] = useState(todo.text);        // Edited text buffer
  const [opacity, setOpacity] = useState(0);                      // Fade-in animation state
  const [isAnimating, setIsAnimating] = useState(false);          // Animation lock
  const [isDragging, setIsDragging] = useState(false);            // Drag state
  const [showCheckBig, setShowCheckBig] = useState(false);        // Completion animation state
  const [showCircle, setShowCircle] = useState(false);            // Restoration animation state
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});  // Dynamic styles
  const itemRef = useRef<HTMLDivElement>(null);                   // DOM reference
  const { finishedButtonRef } = useAnimation();                   // Animation context reference

  const config = getQuadrantConfig(quadrant);

  /**
   * Intersection Observer setup for fade-in animation
   * Observes when the todo item enters the viewport and triggers fade-in
   */
  const observerCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setOpacity(1);
      }
    });
  };

  // Memoize the threshold array for smooth fade-in
  const observerThreshold = Array.from({ length: 100 }, (_, i) => i / 100);

  /**
   * Set up intersection observer for fade-in animation
   * Uses the parent scroll container as the root
   */
  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      root: itemRef.current?.closest(".overflow-y-auto"),
      threshold: observerThreshold,
    });

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /**
   * Text editing handlers
   * Manage the todo item's text editing state and updates
   */
  const handleTextClick = () => {
    if (todo.completed) return;
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(e.target.value);
  };

  const handleTextBlur = () => {
    if (editedText.trim()) {
      updateTodoText(todo.id, editedText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextBlur();
    } else if (e.key === "Escape") {
      setEditedText(todo.text);
      setIsEditing(false);
    }
  };

  /**
   * Due date modal handler
   * Opens the due date modal with the todo's current due date
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
   * Note modal handler
   * Opens the note modal with the todo's current note
   */
  const handleNoteClick = () => {
    if (quadrant === "finished") return;
    openModal("note", {
      todoId: todo.id,
      quadrant,
      initialNote: todo.note,
    });
  };

  /**
   * Animation path calculation
   * Determines the animation path for completion/restoration
   */
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
      const centerX = targetRect.left + targetRect.width / 2;
      const centerY = targetRect.top + targetRect.height / 2;
      
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
      
      const centerX = itemRect.left + itemRect.width / 2;
      const centerY = itemRect.top + itemRect.height / 2;
      
      const translateX = targetRect.left - centerX;
      const translateY = targetRect.top - centerY;

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

  /**
   * Mobile mode detection
   * Returns true if the viewport width is less than the lg breakpoint
   */
  const isMobileMode = () => {
    return window.innerWidth < 1024; // lg breakpoint
  };

  /**
   * Completion animation handler
   * Manages the sequence of animations when marking a todo as complete
   */
  const handleFinish = () => {
    setIsAnimating(true);
    setShowCheckBig(true);
    
    // First do the checkmark animation
    setTimeout(() => {
      setShowCheckBig(false);
      
      // Then start the shrink animation
      setAnimationStyle({
        transform: 'translateX(100%) scale(0.5)',
        opacity: 0,
        transformOrigin: 'right center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'none',
        willChange: 'transform, opacity'
      });

      // After the shrink animation completes, toggle the todo
      setTimeout(() => {
        toggleTodo(todo.id);
        setIsAnimating(false);
        setAnimationStyle({});
      }, 300);
    }, 200);
  };

  /**
   * Restoration animation handler
   * Manages the sequence of animations when restoring a todo
   */
  const handleRestore = () => {
    setIsAnimating(true);
    
    // First show the circle
    setShowCircle(true);
    
    // Then start the shrink animation
    setTimeout(() => {
      setAnimationStyle({
        transform: 'translateX(-100%) scale(0.5)',
        opacity: 0,
        transformOrigin: 'left center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'none',
        willChange: 'transform, opacity'
      });

      // After the shrink animation completes, restore the todo
      setTimeout(() => {
        restoreTodo(todo.id);
        setIsAnimating(false);
        setAnimationStyle({});
        setShowCircle(false);
        if (typeof onRestore === 'function') {
          onRestore();
        }
      }, 300);
    }, 200);
  };

  /**
   * Deletion animation handler
   * Manages the animation when permanently deleting a todo
   */
  const handleDelete = () => {
    setIsAnimating(true);
    
    // Start the scale-down animation
    setAnimationStyle({
      transform: "scale(0)",
      opacity: 0,
      transformOrigin: "center",
      transition: "all 0.3s ease-in-out",
      position: 'relative',
      zIndex: 1,
      pointerEvents: 'none',
      willChange: 'transform, opacity'
    });

    // After the scale-down completes, delete the todo
    setTimeout(() => {
      permanentlyDeleteTodo(todo.id);
      setIsAnimating(false);
      setAnimationStyle({});
    }, 300);
  };

  /**
   * Drag and drop handlers
   * Manage the todo item's drag and drop interactions
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("application/json", JSON.stringify({ todo, fromQuadrant: quadrant }));
    e.dataTransfer.effectAllowed = "move";
    onDragStart(todo)(e);
    
    // Add a semi-transparent clone of the dragged item
    if (e.dataTransfer.setDragImage) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = "0.5";
      dragImage.style.position = "absolute";
      dragImage.style.top = "-1000px";
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  // Function to get the target quadrant element
  const getQuadrantElement = (quadrantKey: QuadrantKey) => {
    return document.querySelector(`[data-quadrant="${quadrantKey}"]`);
  };

  const dueDateStatus = getDueDateStatus(todo.dueDate);

  return (
    <div
      ref={itemRef}
      data-todo-id={todo.id}
      className={`group relative flex items-center gap-2 py-1 ${isOverlay ? "px-0" : "px-2"} rounded-lg transition-all duration-200 
        ${isOverlay ? "w-full" : isDragging ? "w-full" : "w-[95%] mx-auto"}
        ${isDragging || isOverlay ? "opacity-50 scale-95 bg-white" : "bg-white hover:bg-gray-100"}
        ${todo.completed ? "opacity-50" : ""}`}
      style={{ 
        opacity,
        ...animationStyle,
        transition: isAnimating ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.2s ease-in-out'
      }}
      draggable={false}
    >
      {/* Grab Handle */}
      {!todo.completed && (
        <div 
          className="flex-shrink-0 text-gray-400 cursor-grab active:cursor-grabbing"
          draggable={false}
          {...grabHandleProps}
        >
          <Grip className="w-4 h-4" />
        </div>
      )}

      {/* Checkbox/Undo */}
      {todo.completed ? (
        <button
          onClick={handleRestore}
          className={`${iconStyles.base} ${iconStyles.active.check} hover:scale-125`}
          aria-label="Restore task"
          draggable={false}
        >
          {showCheckBig ? (
            <CircleCheckBig className="w-full h-full text-green-700" />
          ) : showCircle ? (
            <Circle className="w-full h-full text-green-700" />
          ) : (
            <CircleCheckBig className="w-full h-full text-green-700" />
          )}
        </button>
      ) : (
        <button
          onClick={handleFinish}
          className={`${iconStyles.base} ${iconStyles.active.check} hover:scale-125`}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          draggable={false}
        >
          {showCheckBig ? (
            <CircleCheckBig className="w-full h-full text-green-700" />
          ) : todo.completed ? (
            <CircleCheck className="w-full h-full" />
          ) : (
            <Circle className="w-full h-full" />
          )}
        </button>
      )}

      {/* Task Name Input - make it grow to fill space */}
      <div className="flex-1 min-w-0 overflow-hidden" draggable={false}>
        {isEditing ? (
          <input
            type="text"
            value={editedText}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-1.5 py-0 text-gray-900 border border-slate-300 rounded focus:outline-none focus:border-slate-800 transition-colors duration-200 pointer-events-auto"
            autoFocus
          />
        ) : (
          <div
            onClick={handleTextClick}
            className={`block w-full px-1.5 py-0 cursor-default truncate
              ${todo.completed ? "text-gray-400" : "text-gray-900"} 
              transition-all duration-200 rounded-md ${!todo.completed ? "border border-transparent hover:border-blue-300" : ""} pointer-events-auto`}
            draggable={false}
          >
            {todo.text}
          </div>
        )}
      </div>

      {/* Action Icons */}
      <div className={`flex items-center gap-0.5 flex-shrink-0 ${isDragging ? "pointer-events-none" : ""}`} draggable={false}>
        {quadrant === "finished" ? (
          <>
            <div className={`${iconStyles.base} ${todo.dueDate ? "text-blue-400" : "text-gray-400"}`} draggable={false}>
              <CalendarIcon size={14} />
            </div>
            <div className={`${iconStyles.base} ${todo.note ? "text-purple-400" : "text-gray-400"}`} draggable={false}>
              <MessageSquareIcon size={14} />
            </div>
            <div className={`${iconStyles.base} ${todo.isWaiting ? "text-orange-400" : "text-gray-400"}`} draggable={false}>
              <HourglassIcon size={14} />
            </div>
            <button
              onClick={handleDelete}
              className={`${iconStyles.base} ${iconStyles.active.delete} hover:scale-120`}
              draggable={false}
            >
              <TrashIcon className="w-3.5 h-3.5" />
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
                      className={`
                        ${iconStyles.base}
                        ${dueDateColorStyles[dueDateStatus]}
                        hover:scale-125
                        ${todo.completed ? "opacity-50" : ""}
                      `}
                      disabled={todo.completed}
                      draggable={false}
                    >
                      <CalendarIcon size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className={`min-w-[120px] text-center ${dueDateTooltipStyles[dueDateStatus]}`} draggable={false}>
                    {format(todo.dueDate, "MMM d, yyyy")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={handleDueDateClick}
                className={`
                  ${iconStyles.base}
                  ${iconStyles.inactiveWithScale}
                  hover:scale-125
                  ${todo.completed ? "opacity-50" : ""}
                `}
                disabled={todo.completed}
                draggable={false}
              >
                <CalendarIcon size={14} />
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
                      draggable={false}
                    >
                      <MessageSquareIcon size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className={`min-w-[200px] max-w-[300px] whitespace-pre-wrap text-left ${iconStyles.tooltip.note}`} draggable={false}>
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
                draggable={false}
              >
                <MessageSquareIcon size={14} />
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
                      draggable={false}
                    >
                      <HourglassIcon size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className={`min-w-[100px] text-center ${iconStyles.tooltip.waiting}`} draggable={false}>
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
                draggable={false}
              >
                <HourglassIcon size={14} />
              </button>
            )}

            <button
              onClick={handleDelete}
              className={`${iconStyles.base} ${iconStyles.active.delete} hover:scale-120`}
              draggable={false}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}