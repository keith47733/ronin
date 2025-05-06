"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Todo, QuadrantKey } from "@/types/todo";

/**
 * Core state management for the Todo application
 * 
 * This context provides a centralized state management system for todos across the application.
 * It handles:
 * 1. Todo CRUD operations (Create, Read, Update, Delete)
 * 2. Quadrant organization and movement
 * 3. Completion status management
 * 4. Local storage persistence
 * 5. Drag and drop reordering
 */
interface TodoContextType {
  quadrants: Record<QuadrantKey, Todo[]>; // Active todos organized by quadrant
  finished: Todo[]; // Completed todos in the finished list
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
  reorderTodo: (todoId: string, toQuadrant: QuadrantKey, toIndex: number) => void;
  reorderTodosInQuadrant: (quadrant: QuadrantKey, newOrder: Todo[]) => void;
}

// Create a type for the quadrant state
type QuadrantState = Record<QuadrantKey, Todo[]>;

// Create the context with undefined as default value
const TodoContext = createContext<TodoContextType | undefined>(undefined);

/**
 * Custom hook to organize todos into their respective quadrants
 * This is a performance-optimized calculation that only runs when todos change
 * 
 * Flow:
 * 1. Takes the flat todos array
 * 2. Separates completed todos into the finished list
 * 3. Distributes active todos into their respective quadrants
 * 4. Returns an object with todos organized by quadrant
 */
const useQuadrants = (todos: Todo[]): QuadrantState => {
  return useMemo(() => {
    const initialQuadrants: QuadrantState = {
      inbox: [],
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
      finished: [],
    };

    return todos.reduce((acc, todo) => {
      if (todo.completed) {
        acc.finished.push(todo);
      } else {
        acc[todo.quadrant].push(todo);
      }
      return acc;
    }, initialQuadrants);
  }, [todos]);
};

/**
 * TodoProvider: The central state management component
 * 
 * Responsibilities:
 * 1. Initializes and maintains the todo state
 * 2. Provides todo management methods to child components
 * 3. Handles persistence to localStorage
 * 4. Manages quadrant organization
 * 
 * State Flow:
 * - todos: Main state array containing all active todos
 * - finished: Separate state for completed todos
 * - quadrants: Derived state organizing todos by quadrant
 * 
 * Data Flow:
 * 1. User actions trigger context methods
 * 2. Methods update the state
 * 3. State changes trigger re-renders
 * 4. Local storage is updated automatically
 */
export function TodoProvider({ children }: { children: React.ReactNode }) {
  // Main state for all todos
  const [todos, setTodos] = useState<Todo[]>([]);
  const [finished, setFinished] = useState<Todo[]>([]);
  const quadrants = useQuadrants(todos);

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    const savedFinished = localStorage.getItem("finished");

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedFinished) {
      setFinished(JSON.parse(savedFinished));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("finished", JSON.stringify(finished));
  }, [finished]);

  /**
   * Adds a new todo to the inbox quadrant
   * 
   * Flow:
   * 1. Validates input (prevents empty todos)
   * 2. Creates new todo with unique ID and timestamp
   * 3. Adds to the todos array
   * 4. Automatically persists to localStorage
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
   * Marks a todo as finished and moves it to the finished list
   * 
   * Flow:
   * 1. Creates a copy of the todo with completed status
   * 2. Preserves the original quadrant information
   * 3. Removes the original todo
   * 4. Adds the completed copy to the state
   * 5. Triggers re-render and storage update
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
   * Restores a finished todo back to active status
   * 
   * Flow:
   * 1. Finds the finished todo
   * 2. Creates a copy with active status
   * 3. Preserves the original quadrant
   * 4. Removes from finished list
   * 5. Adds back to active todos
   * 6. Triggers re-render and storage update
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
   * Toggles a todo's completion status
   * 
   * Flow:
   * 1. When marking complete:
   *    - Preserves current quadrant
   *    - Sets completed flag
   *    - Moves to finished list
   * 2. When marking incomplete:
   *    - Restores to original quadrant
   *    - Clears completed flag
   *    - Returns to active todos
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
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id
            ? {
                ...t,
                quadrant: toQuadrant,
              }
            : t
        )
      );
    },
    []
  );

  /**
   * Reorders a todo within the same quadrant
   * @param todoId - The id of the todo to move
   * @param toQuadrant - The quadrant key
   * @param toIndex - The index to move the todo to
   */
  const reorderTodo = useCallback((todoId: string, toQuadrant: QuadrantKey, toIndex: number) => {
    setTodos((prev) => {
      // Get all todos in the target quadrant
      const filtered = prev.filter((t) => t.quadrant === toQuadrant && !t.completed);
      const other = prev.filter((t) => t.quadrant !== toQuadrant || t.completed);
      const fromIndex = filtered.findIndex((t) => t.id === todoId);
      if (fromIndex === -1) return prev;
      const [moved] = filtered.splice(fromIndex, 1);
      filtered.splice(toIndex, 0, moved);
      // Rebuild the todos array, preserving order for other quadrants
      const reordered = [
        ...other,
        ...filtered
      ];
      // Sort by createdAt for finished todos if needed
      return reordered;
    });
  }, []);

  /**
   * Reorders todos within a specific quadrant
   * @param quadrant - The quadrant key
   * @param newOrder - The new ordered array of todos for that quadrant
   */
  const reorderTodosInQuadrant = useCallback((quadrant: QuadrantKey, newOrder: Todo[]) => {
    setTodos((prev) => {
      // Remove todos from this quadrant
      const others = prev.filter((t) => t.quadrant !== quadrant);
      // Add the reordered todos for this quadrant
      return [...others, ...newOrder];
    });
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders
   * Only updates when dependencies change
   */
  const value = useMemo(
    () => ({
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
      reorderTodo,
      reorderTodosInQuadrant,
    }),
    [
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
      reorderTodo,
      reorderTodosInQuadrant,
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
