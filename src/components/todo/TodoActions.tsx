import { format } from "date-fns";
import {
  CalendarIcon,
  MessageSquareIcon,
  ClockIcon,
  TrashIcon,
} from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { Todo, QuadrantKey } from "@/types/todo";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";
import { useTodo } from "@/context/TodoContext";
import { QUADRANT_CONFIGS } from "@/constants/quadrants";

interface TodoActionsProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  quadrant: QuadrantKey;
}

export function TodoActions({
  todo,
  onDelete,
  onEdit,
  quadrant,
}: TodoActionsProps) {
  const { openModal } = useModal();
  const { toggleWaiting } = useTodo();

  if (!todo) return null;

  const getBackgroundColor = () => {
    return QUADRANT_CONFIGS[quadrant]?.bgColor || "bg-gray-500";
  };

  const getIconColor = () => {
    return QUADRANT_CONFIGS[quadrant]?.chevronColor?.split(" ")[0] || "text-gray-500";
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onEdit(todo)}
              className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
            >
              <MessageSquareIcon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Edit todo</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => openModal("dueDate", { todoId: todo.id, quadrant })}
              className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {todo.dueDate
              ? `Current: ${format(todo.dueDate, "MMMM d, yyyy")}`
              : "Set due date"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleWaiting(todo.id)}
              className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
            >
              <ClockIcon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {todo.isWaiting
              ? "Waiting for third-party action to proceed."
              : "Not waiting for third-party action to proceed."}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onDelete(todo.id)}
              className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Delete todo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
