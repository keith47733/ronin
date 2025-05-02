import React from "react";
import { Button } from "../ui/Button";
import { RotateCcw, Check, Square } from "lucide-react";

interface TodoCheckboxProps {
  completed: boolean;
  onToggle: () => void;
  todoText: string;
  isFinished?: boolean;
}

export function TodoCheckbox({
  completed,
  onToggle,
  todoText,
  isFinished = false,
}: TodoCheckboxProps) {
  if (isFinished) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="p-1 rounded-full hover:bg-gray-100 group"
        aria-label={`Restore task "${todoText}"`}
        title="Restore task"
      >
        <RotateCcw className="w-4 h-4 text-green-600 group-hover:text-green-700" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`p-1 rounded-full transition-all duration-200 ${
        completed
          ? "text-success-600 hover:bg-success-100"
          : "text-gray-400 hover:bg-gray-100"
      }`}
      aria-label={`${completed ? "Uncomplete" : "Complete"} task "${todoText}"`}
    >
      <div className="h-5 w-5 flex items-center justify-center">
        {completed ? (
          <Check className="h-5 w-5" />
        ) : (
          <Square className="h-4 w-4 border-2 border-gray-400 rounded-sm" />
        )}
      </div>
    </Button>
  );
}
