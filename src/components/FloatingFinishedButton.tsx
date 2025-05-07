import React from "react";
import { useTodo } from "@/context/TodoContext";
import { useModal } from "@/context/ModalContext";
import { useAnimation } from "@/context/AnimationContext";
import { Button } from "@/components/ui/Button";
import { CircleCheckBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinishedButtonInHeader() {
  const { finished } = useTodo();
  const { openModal } = useModal();
  const { finishedButtonRef } = useAnimation();

  const handleOpenFinished = () => {
    openModal("finished", { todos: finished });
  };

  return (
    <Button
      ref={finishedButtonRef}
      variant="ghost"
      onClick={handleOpenFinished}
      className="bg-black/90 backdrop-blur-sm text-white font-ronin text-5xl font-bold p-3 ring-1 ring-gray-500 hover:bg-red-700/50 hover:ring-gray-300 shadow-lg relative"
      style={{ borderRadius: 9999 }}
      aria-label="Show finished tasks"
    >
      <div className="relative">
        <CircleCheckBig className="h-7 w-7" />
        <Badge
          className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full"
          variant="destructive"
        >
          {finished.length}
        </Badge>
      </div>
    </Button>
  );
} 