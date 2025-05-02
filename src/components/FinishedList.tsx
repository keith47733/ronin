"use client";

import React from "react";
import { Todo } from "@/types/todo";
import {
  RotateCcw,
  Trash2,
  XCircle,
  Calendar,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useTodo } from "@/context/TodoContext";

interface FinishedListProps {
  tasks: Todo[];
  onRestore: (id: string) => void;
  onClose: () => void;
}

export function FinishedList({ tasks, onRestore, onClose }: FinishedListProps) {
  const { permanentlyDeleteTodo } = useTodo();

  return (
    <div className="absolute right-0 top-16 w-96 bg-white shadow-lg rounded-md overflow-hidden z-50">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-end">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="Close finished tasks"
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">No finished tasks</div>
        ) : (
          <div className="p-2 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <button
                    onClick={() => onRestore(task.id)}
                    className="text-blue-500 hover:text-blue-600 p-1"
                    title="Restore task"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <span className="line-through text-gray-600">
                    {task.text}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Due Date Icon */}
                  <div
                    className={`p-1 ${
                      task.dueDate
                        ? "text-primary-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        : "text-gray-300"
                    }`}
                    title={
                      task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"
                    }
                  >
                    <Calendar className="h-5 w-5" />
                  </div>

                  {/* Note Icon */}
                  <div
                    className={`p-1 ${
                      task.note
                        ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        : "text-gray-300"
                    }`}
                    title={task.note || "No note"}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  {/* Waiting Icon */}
                  <div
                    className={`p-1 ${
                      task.isWaiting
                        ? "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                        : "text-gray-300"
                    }`}
                    title={task.isWaiting ? "Was waiting" : "Not waiting"}
                  >
                    <Clock className="h-5 w-5" />
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => permanentlyDeleteTodo(task.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Permanently delete task"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
