"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Todo, QuadrantKey } from "@/types/todo";

/**
 * Interface defining the shape of our Todo context
 * Contains all the state and methods needed to manage todos across the application
 */
interface TodoContextType {
  todos: Todo[]; // Complete list of all todos
  quadrants: Record<QuadrantKey, Todo[]>; // Todos organized by quadrant
  finished: Todo[]; // Completed todos
  addTodo: (text: string) => void;
  deleteTodo: (id: string) => void;
  permanentlyDeleteTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  toggleWaiting: (id: string) => void;
  updateTodoText: (id: string, text: string) => void;
  updateTodoDueDate: (id: string, date: Date | undefined) => void;
  updateTodoNote: (id: string, note: string) => void;
  moveTodo: (
    todo: Todo,
    fromQuadrant: QuadrantKey,
    toQuadrant: QuadrantKey
  ) => void;
}

// Create the context with undefined as default value
const TodoContext = createContext<TodoContextType | undefined>(undefined);

/**
 * TodoProvider component that wraps the application and provides todo management functionality
 * @param children - React components that will have access to the todo context
 */
export function TodoProvider({ children }: { children: React.ReactNode }) {
  // Main state for all todos
  const [todos, setTodos] = useState<Todo[]>([]);

  /**
   * Memoized calculation of todos organized by quadrant
   * Prevents unnecessary recalculations on every render
   */
  const quadrants = useMemo(
    () => ({
      inbox: todos.filter(
        (todo) => !todo.completed && todo.quadrant === "inbox"
      ),
      urgentImportant: todos.filter(
        (todo) => !todo.completed && todo.quadrant === "urgentImportant"
      ),
      notUrgentImportant: todos.filter(
        (todo) => !todo.completed && todo.quadrant === "notUrgentImportant"
      ),
      urgentNotImportant: todos.filter(
        (todo) => !todo.completed && todo.quadrant === "urgentNotImportant"
      ),
      notUrgentNotImportant: todos.filter(
        (todo) => !todo.completed && todo.quadrant === "notUrgentNotImportant"
      ),
      finished: todos.filter((todo) => todo.completed),
    }),
    [todos]
  );

  /**
   * Adds a new todo to the list
   * @param text - The text content of the new todo
   * @remarks
   * New todos are always created in the "inbox" quadrant
   */
  const addTodo = useCallback((text: string) => {
    if (!text.trim()) return; // Prevent empty todos
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      isWaiting: false,
      createdAt: new Date(),
      quadrant: "inbox", // Initialize with inbox quadrant
    };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  /**
   * Marks a todo as finished
   * @param id - The ID of the todo to mark as finished
   * @remarks
   * When a todo is marked as finished:
   * 1. Creates an exact copy (including ID) of the todo in the finished list
   * 2. Marks the copy as inactive
   * 3. Deletes the original active todo
   */
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const todoToFinish = prev.find((todo) => todo.id === id);
      if (!todoToFinish) return prev;

      console.log("Marking as finished:", {
        id: todoToFinish.id,
        currentQuadrant: todoToFinish.quadrant,
      });

      // Create an exact copy for the finished list
      const finishedCopy = {
        ...todoToFinish,
        completed: true,
        quadrant: todoToFinish.quadrant, // Preserve the quadrant
      };

      // Remove the original todo and add the finished copy
      return [...prev.filter((todo) => todo.id !== id), finishedCopy];
    });
  }, []);

  /**
   * Permanently removes a todo from the list
   * @param id - The ID of the todo to permanently delete
   */
  const permanentlyDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  /**
   * Restores a finished todo back to its active state
   * @param id - The ID of the todo to restore
   * @remarks
   * When a todo is restored:
   * 1. Creates an exact copy (including ID) of the finished todo
   * 2. Places it in the quadrant it was in when finished (currentQuadrant)
   * 3. Marks it as active
   * 4. Deletes the finished copy
   */
  const restoreTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const todoToRestore = prev.find((todo) => todo.id === id);
      if (!todoToRestore) return prev;

      console.log("Restoring todo:", {
        id: todoToRestore.id,
        currentQuadrant: todoToRestore.quadrant,
      });

      // Create an exact copy for the original quadrant
      const restoredTodo = {
        ...todoToRestore,
        completed: false,
        quadrant: todoToRestore.quadrant, // Keep the same quadrant
      };

      // Remove the finished todo and add the restored one
      return prev.filter((todo) => todo.id !== id).concat(restoredTodo);
    });
  }, []);

  /**
   * Toggles the completion status of a todo
   * When marking as complete, moves the todo to the finished list
   * When marking as incomplete, restores the todo to its original quadrant
   * @param id - The ID of the todo to toggle
   */
  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          // If marking as complete, store current quadrant and mark as completed
          if (!todo.completed) {
            console.log("Marking as complete:", {
              id: todo.id,
              currentQuadrant: todo.quadrant,
            });
            return {
              ...todo,
              completed: true,
              quadrant: todo.quadrant, // Keep the current quadrant
            };
          }
          // If marking as incomplete, restore to previous quadrant
          return {
            ...todo,
            completed: false,
            quadrant: todo.quadrant, // Keep the current quadrant
          };
        }
        return todo;
      })
    );
  }, []);

  /**
   * Toggles the waiting status of a todo
   * @param id - The ID of the todo to toggle
   */
  const toggleWaiting = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isWaiting: !todo.isWaiting } : todo
      )
    );
  }, []);

  /**
   * Updates the text content of a todo
   * @param id - The ID of the todo to update
   * @param text - The new text content
   */
  const updateTodoText = useCallback((id: string, text: string) => {
    if (!text.trim()) return; // Prevent empty text
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
  }, []);

  /**
   * Updates the due date of a todo
   * @param id - The ID of the todo to update
   * @param date - The new due date (can be undefined to remove the due date)
   */
  const updateTodoDueDate = useCallback(
    (id: string, date: Date | undefined) => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, dueDate: date } : todo))
      );
    },
    []
  );

  /**
   * Updates the note of a todo
   * @param id - The ID of the todo to update
   * @param note - The new note content
   */
  const updateTodoNote = useCallback((id: string, note: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, note } : todo))
    );
  }, []);

  /**
   * Moves a todo from one quadrant to another
   * @param todo - The todo to move
   * @param fromQuadrant - The source quadrant
   * @param toQuadrant - The destination quadrant
   * @remarks
   * The todo's quadrant is updated to the new location.
   * This is the only operation that changes a todo's quadrant.
   */
  const moveTodo = useCallback(
    (todo: Todo, fromQuadrant: QuadrantKey, toQuadrant: QuadrantKey) => {
      if (fromQuadrant === toQuadrant) return; // Prevent unnecessary updates

      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === todo.id) {
            const updatedTodo = {
              ...t,
              quadrant: toQuadrant,
            };
            console.log("Moving todo:", {
              id: updatedTodo.id,
              fromQuadrant,
              toQuadrant,
              currentQuadrant: updatedTodo.quadrant,
            });
            return updatedTodo;
          }
          return t;
        })
      );
    },
    []
  );

  /**
   * Memoized context value to prevent unnecessary re-renders
   * Only updates when dependencies change
   */
  const value = useMemo(
    () => ({
      todos,
      quadrants,
      finished: quadrants.finished,
      addTodo,
      deleteTodo,
      permanentlyDeleteTodo,
      restoreTodo,
      toggleTodo,
      toggleWaiting,
      updateTodoText,
      updateTodoDueDate,
      updateTodoNote,
      moveTodo,
    }),
    [
      todos,
      quadrants,
      addTodo,
      deleteTodo,
      permanentlyDeleteTodo,
      restoreTodo,
      toggleTodo,
      toggleWaiting,
      updateTodoText,
      updateTodoDueDate,
      updateTodoNote,
      moveTodo,
    ]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

/**
 * Custom hook to access the todo context
 * @throws Error if used outside of TodoProvider
 */
export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}
