import React from "react";
import {
  CalendarIcon,
  MessageSquareIcon,
  TrashIcon,
  HourglassIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { format } from "date-fns";
import { Todo, QuadrantKey } from "@/types/todo";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";

interface TodoItemActionsProps {
  todo: Todo;
  quadrant: QuadrantKey;
  isDragging: boolean;
  onDueDateClick: (e: React.MouseEvent) => void;
  onNoteClick: () => void;
  onWaitingClick: () => void;
  onDeleteClick: () => void;
}

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

// Helper to get quadrant config
function getQuadrantConfig(quadrant: QuadrantKey) {
  return QUADRANT_CONFIGS[quadrant] || QUADRANT_CONFIGS.inbox;
}

export function TodoItemActions({
  todo,
  quadrant,
  isDragging,
  onDueDateClick,
  onNoteClick,
  onWaitingClick,
  onDeleteClick,
}: TodoItemActionsProps) {
  const config = getQuadrantConfig(quadrant);
  return (
    <div className={`flex items-center gap-1 flex-shrink-0 ${isDragging ? "pointer-events-none" : ""}`} draggable={false}>
      {quadrant === "finished" ? (
        <>
          <div className={`${iconStyles.base} ${todo.dueDate ? config.chevronColor.split(" ")[0] : "text-gray-400"}`} draggable={false}>
            <CalendarIcon size={14} />
          </div>
          <div className={`${iconStyles.base} ${todo.note ? "text-purple-400" : "text-gray-400"}`} draggable={false}>
            <MessageSquareIcon size={14} />
          </div>
          <div className={`${iconStyles.base} ${todo.isWaiting ? "text-orange-400" : "text-gray-400"}`} draggable={false}>
            <HourglassIcon size={14} />
          </div>
          <button
            onClick={onDeleteClick}
            className={`${iconStyles.base} ${iconStyles.active.delete} hover:scale-110`}
            draggable={false}
            aria-label="Delete finished todo"
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
                    onClick={onDueDateClick}
                    className={`${iconStyles.base} ${config.chevronColor.split(" ")[0]} bg-white/80 hover:bg-white/90 border ${todo.dueDate ? config.chevronColor.split(" ")[0] : "border-gray-300"} hover:border-blue-300`}
                    disabled={todo.completed}
                    draggable={false}
                    aria-label="Due date"
                  >
                    <CalendarIcon size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className={`min-w-[120px] text-center ${iconStyles.tooltip.calendar}`} draggable={false}>
                  {format(todo.dueDate, "MMM d, yyyy")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              onClick={onDueDateClick}
              className={`${iconStyles.base} ${config.chevronColor.split(" ")[0]} bg-white/80 hover:bg-white/90 border border-gray-300`}
              disabled={todo.completed}
              draggable={false}
              aria-label="Due date"
            >
              <CalendarIcon size={14} />
            </button>
          )}

          {todo.note && !todo.completed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onNoteClick}
                    className={`${iconStyles.base} text-purple-500 bg-white/80 hover:bg-white/90 border border-purple-300`}
                    disabled={todo.completed}
                    draggable={false}
                    aria-label="Note"
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
              onClick={onNoteClick}
              className={`${iconStyles.base} text-purple-500 bg-white/80 hover:bg-white/90 border border-purple-300`}
              disabled={todo.completed}
              draggable={false}
              aria-label="Note"
            >
              <MessageSquareIcon size={14} />
            </button>
          )}

          {todo.isWaiting && !todo.completed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onWaitingClick}
                    className={`${iconStyles.base} text-orange-500 bg-white/80 hover:bg-white/90 border border-orange-300`}
                    disabled={todo.completed}
                    draggable={false}
                    aria-label="Waiting"
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
              onClick={onWaitingClick}
              className={`${iconStyles.base} text-orange-500 bg-white/80 hover:bg-white/90 border border-orange-300`}
              disabled={todo.completed}
              draggable={false}
              aria-label="Waiting"
            >
              <HourglassIcon size={14} />
            </button>
          )}

          <button
            onClick={onDeleteClick}
            className={`${iconStyles.base} ${iconStyles.active.delete} hover:scale-110`}
            draggable={false}
            aria-label="Delete todo"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
} 