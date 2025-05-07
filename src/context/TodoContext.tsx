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
import { useModal } from "@/context/ModalContext";

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
      finished: [], // not used, but kept for type compatibility
    };

    todos.forEach((todo) => {
      if (!todo.completed) {
        initialQuadrants[todo.quadrant].push(todo);
      }
    });
    return initialQuadrants;
  }, [todos]);
};

// Helper functions for date serialization/deserialization
function serializeTodos(todos: Todo[]): any[] {
  return todos.map((todo) => ({
    ...todo,
    createdAt: todo.createdAt instanceof Date ? todo.createdAt.toISOString() : todo.createdAt,
    dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate || undefined,
  }));
}

function deserializeTodos(raw: any[]): Todo[] {
  let corruptedCount = 0;
  const validTodos = [];
  for (const todo of raw) {
    try {
      const deserialized = {
        ...todo,
        createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      };
      // Basic validation: must have id and text
      if (deserialized.id && deserialized.text) {
        validTodos.push(deserialized);
      } else {
        corruptedCount++;
      }
    } catch {
      corruptedCount++;
    }
  }
  return validTodos;
}

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
  // Main state for all todos (active and completed)
  const [todos, setTodos] = useState<Todo[]>([]);
  const quadrants = useQuadrants(todos);
  const { openModal } = useModal();

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      try {
        const raw = JSON.parse(savedTodos);
        let corruptedCount = 0;
        const validTodos = [];
        for (const todo of raw) {
          try {
            const deserialized = {
              ...todo,
              createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            };
            // Basic validation: must have id and text
            if (deserialized.id && deserialized.text) {
              validTodos.push(deserialized);
            } else {
              corruptedCount++;
            }
          } catch {
            corruptedCount++;
          }
        }
        setTodos(validTodos);
        if (corruptedCount > 0) {
          setTimeout(() => {
            openModal("error", {
              message: `Some data was corrupted.`,
              corruptedCount,
              allCorrupt: validTodos.length === 0,
            });
          }, 0);
        }
      } catch (err) {
        setTodos([]); // fallback to empty list
        setTimeout(() => {
          openModal("error", {
            message: "Could not load your tasks due to corrupted data.",
            corruptedCount: 0,
            allCorrupt: true,
          });
        }, 0);
      }
    }
  }, [openModal]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(serializeTodos(todos)));
  }, [todos]);

  /**
   * Adds a new todo to the inbox quadrant
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
   * Marks a todo as completed (finished)
   */
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: true } : todo
      )
    );
  }, []);

  /**
   * Permanently removes a todo from the list
   */
  const permanentlyDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  /**
   * Restores a finished todo back to active status
   */
  const restoreTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: false } : todo
      )
    );
  }, []);

  /**
   * Toggles a todo's completion status
   */
  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
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
      finished: todos.filter((t) => t.completed),
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
      todos,
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
