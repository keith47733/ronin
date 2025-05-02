import { format } from "date-fns";
import {
  CalendarIcon,
  MessageSquareIcon,
  ClockIcon,
  TrashIcon,
} from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { Todo, QuadrantKey } from "@/types/todo";
import { Tooltip } from "@/components/ui/Tooltip";
import { useTodo } from "@/context/TodoContext";

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
    switch (quadrant) {
      case "urgentImportant":
        return "bg-blue-500";
      case "notUrgentImportant":
        return "bg-green-500";
      case "urgentNotImportant":
        return "bg-yellow-500";
      case "notUrgentNotImportant":
        return "bg-red-500";
      case "inbox":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getIconColor = () => {
    switch (quadrant) {
      case "urgentImportant":
        return "text-blue-500";
      case "notUrgentImportant":
        return "text-green-500";
      case "urgentNotImportant":
        return "text-yellow-500";
      case "notUrgentNotImportant":
        return "text-red-500";
      case "inbox":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip
        content="Edit todo"
        bgColor={getBackgroundColor()}
        textColor="text-white"
      >
        <button
          onClick={() => onEdit(todo)}
          className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
        >
          <MessageSquareIcon className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip
        content={
          todo.dueDate
            ? `Current: ${format(new Date(todo.dueDate), "MMMM d, yyyy")}`
            : "Set due date"
        }
        bgColor={getBackgroundColor()}
        textColor="text-white"
      >
        <button
          onClick={() => openModal("dueDate", { todoId: todo.id, quadrant })}
          className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip
        content={
          todo.isWaiting
            ? "Waiting for third-party action to proceed."
            : "Not waiting for third-party action to proceed."
        }
        bgColor={getBackgroundColor()}
        textColor="text-white"
      >
        <button
          onClick={() => toggleWaiting(todo.id)}
          className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
        >
          <ClockIcon className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip
        content="Delete todo"
        bgColor={getBackgroundColor()}
        textColor="text-white"
      >
        <button
          onClick={() => onDelete(todo.id)}
          className={`p-2 rounded-full hover:bg-opacity-20 ${getIconColor()} hover:${getBackgroundColor()} hover:bg-opacity-20`}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
}
