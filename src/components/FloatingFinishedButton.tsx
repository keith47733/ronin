// FloatingFinishedButton displays a floating button showing the number of finished tasks.
// Uses context to access finished todos and modal state, and coordinates with animation context for UI effects.
import React from "react";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import { Button } from "@/components/ui/Button";
import { CircleCheckBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * FloatingFinishedButton
 *
 * - Shows a floating button with a badge for the number of finished tasks
 * - Clicking the button opens the finished tasks modal
 * - Uses context for state and animation ref for coordinated UI effects
 */
export default function FinishedButtonInHeader() {
  // Get finished todos from context
  const { finished } = useTodo();
  // Modal context for opening the finished modal
  const { openModal } = useModal();
  // Animation context for ref to the button
  const { finishedButtonRef } = useAnimation();

  // Open the finished modal when button is clicked
  const handleOpenFinished = () => {
    openModal("finished", { todos: finished });
  };

  return (
    <Button
      ref={finishedButtonRef}
      variant="ghost"
      onClick={handleOpenFinished}
      className="shadow-lg shadow-green-500/50 mt-2 bg-green-500 border-2 border-gray-300 text-white font-ronin text-5xl font-bold p-3 hover:bg-green-600 shadow-lg relative"
      style={{ borderRadius: 9999 }}
      aria-label="Show finished tasks"
    >
      <div className="relative">
        <CircleCheckBig className="h-7 w-7" />
        {/* Badge shows the number of finished tasks */}
        <Badge
          className="absolute bg-red-600 font-ronin font-light text-sm text-white -top-4 -right-3 p-2 pt-3 min-w-[1.25rem] h-6 flex items-center justify-center rounded-full"
          variant="destructive"
        >
          {finished.length}
        </Badge>
      </div>
    </Button>
  );
} 