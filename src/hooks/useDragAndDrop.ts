import { DragEvent, useState } from "react";
import { DragData, Todo, QuadrantKey } from "@/types/todo";

interface UseDragAndDropProps {
  onDrop: (data: DragData) => void;
  onError?: (error: string) => void;
}

export function useDragAndDrop({ onDrop, onError }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<HTMLElement | null>(null);

  const handleDragStart =
    (todo: Todo, quadrant: QuadrantKey) => (e: DragEvent) => {
      try {
        setIsDragging(true);
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            todo,
            fromQuadrant: quadrant,
          })
        );
        // Add visual feedback to the dragged element
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.classList.add("opacity-50", "scale-95");
        }
      } catch (error) {
        onError?.("Failed to start dragging: " + (error as Error).message);
        setIsDragging(false);
      }
    };

  const handleDragEnd = (e: DragEvent) => {
    try {
      setIsDragging(false);
      setDragTarget(null);
      // Remove visual feedback from the dragged element
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("opacity-50", "scale-95");
      }
    } catch (error) {
      onError?.("Failed to end drag: " + (error as Error).message);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    try {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) {
        setDragTarget(e.currentTarget);
        e.currentTarget.classList.add("ring-2", "ring-blue-500");
      }
    } catch (error) {
      onError?.("Failed to handle drag over: " + (error as Error).message);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    try {
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-500");
      }
    } catch (error) {
      onError?.("Failed to handle drag leave: " + (error as Error).message);
    }
  };

  const handleDrop = (e: DragEvent) => {
    try {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-500");
      }
      const data = JSON.parse(e.dataTransfer.getData("text/plain")) as DragData;
      onDrop(data);
    } catch (error) {
      onError?.("Failed to handle drop: " + (error as Error).message);
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-500");
      }
    }
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    dragTarget,
  };
}
