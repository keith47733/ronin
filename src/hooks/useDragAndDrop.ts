import { useState } from "react";
import { DragData, Todo } from "@/types/todo";

interface UseDragAndDropProps {
  onDrop: (data: DragData) => void;
  onError?: (error: string) => void;
}

export function useDragAndDrop({ onDrop, onError }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<HTMLElement | null>(null);

  const handleDragStart = (todo: Todo) => (e: DragEvent) => {
    try {
      setIsDragging(true);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            todo,
          })
        );
      }
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.add("opacity-50", "scale-95");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to start drag");
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    try {
      e.preventDefault();
      if (e.dataTransfer) {
        const data = JSON.parse(e.dataTransfer.getData("application/json")) as DragData;
        onDrop(data);
      }
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-500");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to drop");
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-500");
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    try {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
      if (e.currentTarget instanceof HTMLElement) {
        setDragTarget(e.currentTarget);
        e.currentTarget.classList.add("ring-2", "ring-blue-500");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to handle drag over");
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    try {
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-500");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to handle drag leave");
    }
  };

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    dragTarget,
  };
}
