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
  pendingMove: { todoId: string, toQuadrant: QuadrantKey } | null;
  setPendingMove: (move: { todoId: string, toQuadrant: QuadrantKey } | null) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

// Create a type for the quadrant state
// Each quadrant key maps to an array of todos
// This makes it easy to render and manage todos by quadrant
//
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

// Utility functions for robust, consistent reordering
function removeAndReorder(list: Todo[], id: string): Todo[] {
  return list.filter(t => t.id !== id).map((t, idx) => ({ ...t, order: idx }));
}

function addAndReorder(list: Todo[], todo: Todo): Todo[] {
  // Remove any existing instance of the todo before appending
  const filtered = list.filter(t => t.id !== todo.id);
  return [...filtered, todo].map((t, idx) => ({ ...t, order: idx }));
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
export function TodoProvider({ children, initialTodos = [] }: { children: React.ReactNode, initialTodos?: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const quadrants = useQuadrants(todos);
  const { openModal } = useModal();

  // Track a pending move for robust cross-quadrant and finished/quadrant ordering
  // Used for drag-and-drop, finishing, and restoring
  const [pendingMove, setPendingMove] = useState<{ todoId: string, toQuadrant: QuadrantKey } | null>(null);

  // Add todo via API
  /**
   * Adds a new todo and ensures it is appended to the end of its quadrant.
   * - After adding, reorders the quadrant to ensure the new todo is last and order fields are correct.
   * - Scrolls the inbox listview to show the new item (handled in the component).
   */
  const addTodo = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos(prev => {
      // Remove any accidental duplicate (shouldn't happen, but for safety)
      const filtered = prev.filter(t => t.id !== newTodo.id);
      // Find all todos in the new todo's quadrant
      const quadrantTodos = filtered.filter(t => t.quadrant === newTodo.quadrant && !t.completed);
      const others = filtered.filter(t => t.quadrant !== newTodo.quadrant || t.completed);
      const newQuadrant = addAndReorder(quadrantTodos, newTodo);
      const updates = newQuadrant.map((t, idx) => ({ id: t.id, order: idx }));
      fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      return [...others, ...newQuadrant];
    });
    setPendingMove({ todoId: newTodo.id, toQuadrant: 'inbox' });
  }, []);

  // Update todo via API
  const updateTodo = useCallback(async (updated: Todo) => {
    const res = await fetch('/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const todo = await res.json();
    setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
  }, []);

  // Delete todo via API
  const deleteTodo = useCallback(async (id: string) => {
    await fetch('/api/todos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  // Mark as completed (finished)
  /**
   * Marks a todo as completed (finished).
   * - Removes from all lists, then inserts as the first item in the finished list, reorders and persists.
   * - Existing finished tasks are bumped down.
   * - Scrolls finished listview to show new item (handled in FinishedModal).
   */
  const markCompleted = useCallback(async (id: string) => {
    setTodos(prev => {
      const todo = prev.find(t => t.id === id);
      if (!todo) return prev;
      // Remove from all lists
      const filtered = prev.filter(t => t.id !== id);
      // Get all finished tasks and bump their order by 1
      const finished = filtered.filter(t => t.completed).map(t => ({ ...t, order: t.order + 1 }));
      const others = filtered.filter(t => !t.completed);
      // Set the new finished task's order to 0
      const newFinishedTask = { ...todo, completed: true, order: 0 };
      // Prepend the new finished task (no sort)
      const newFinished = [newFinishedTask, ...finished];
      // Assign correct order values in state
      const newFinishedWithOrder = newFinished.map((t, idx) => ({ ...t, order: idx }));
      // Persist new order for finished list
      fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: newFinishedWithOrder.map((t, idx) => ({ id: t.id, order: idx })) }),
      });
      return [...others, ...newFinishedWithOrder];
    });
    setPendingMove({ todoId: id, toQuadrant: 'finished' });
  }, [setTodos, setPendingMove]);

  // Restore a finished todo
  /**
   * Restores a finished todo to its quadrant.
   * - Removes from all lists, then adds to end of destination quadrant, reorders and persists.
   * - Scrolls destination listview to show new item (handled in Quadrant).
   */
  const restoreTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, completed: false });
      setTodos(prev => {
        // Remove the todo from all lists (to prevent duplicates)
        const filtered = prev.filter(t => t.id !== id);
        // Add to end of destination quadrant and reorder
        const quadrantTodos = filtered.filter(t => t.quadrant === todo.quadrant && !t.completed);
        const others = filtered.filter(t => t.quadrant !== todo.quadrant || t.completed);
        const newQuadrant = addAndReorder(quadrantTodos, { ...todo, completed: false });
        // Persist destination list
        fetch('/api/todos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: newQuadrant.map((t, idx) => ({ id: t.id, order: idx })) }),
        });
        return [...others, ...newQuadrant];
      });
      setPendingMove({ todoId: todo.id, toQuadrant: todo.quadrant });
    }
  }, [todos, updateTodo]);

  // Toggle completion
  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, completed: !todo.completed });
    }
  }, [todos, updateTodo]);

  // Toggle waiting
  const toggleWaiting = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, isWaiting: !todo.isWaiting });
    }
  }, [todos, updateTodo]);

  // Update text
  const updateTodoText = useCallback(async (id: string, text: string) => {
    if (!text.trim()) return;
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, text });
    }
  }, [todos, updateTodo]);

  // Update due date
  const updateTodoDueDate = useCallback(async (id: string, date: Date | undefined) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, dueDate: date });
    }
  }, [todos, updateTodo]);

  // Update note
  const updateTodoNote = useCallback(async (id: string, note: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo({ ...todo, note });
    }
  }, [todos, updateTodo]);

  // Move todo between quadrants
  /**
   * Moves a todo to a different quadrant (drag-and-drop or programmatic move).
   * - Removes from all lists, then adds to end of destination quadrant, reorders and persists.
   * - Scrolls destination listview to show new item (handled in Quadrant).
   */
  const moveTodo = useCallback(async (todo: Todo, fromQuadrant: QuadrantKey, toQuadrant: QuadrantKey) => {
    if (todo.quadrant !== toQuadrant) {
      await updateTodo({ ...todo, quadrant: toQuadrant });
      setTodos(prev => {
        // Remove the todo from all lists (to prevent duplicates)
        const filtered = prev.filter(t => t.id !== todo.id);
        // Add to end of destination quadrant and reorder
        const destQuadrant = filtered.filter(t => t.quadrant === toQuadrant && !t.completed);
        const others = filtered.filter(t => t.quadrant !== toQuadrant || t.completed);
        const newDest = addAndReorder(destQuadrant, { ...todo, quadrant: toQuadrant });
        // Persist destination list
        fetch('/api/todos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: newDest.map((t, idx) => ({ id: t.id, order: idx })) }),
        });
        return [...others, ...newDest];
      });
      setPendingMove({ todoId: todo.id, toQuadrant });
    }
  }, [updateTodo]);

  /**
   * Permanently deletes a todo.
   * - Removes from all lists, reorders the remaining tasks in the same quadrant, and persists the new order.
   */
  const permanentlyDeleteTodo = useCallback(async (id: string) => {
    // Find the todo to get its quadrant
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    await fetch('/api/todos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setTodos(prev => {
      // Remove from all lists
      const filtered = prev.filter(t => t.id !== id);
      // Reorder the remaining tasks in the same quadrant
      const quadrantTodos = filtered.filter(t => t.quadrant === todo.quadrant && !t.completed);
      const others = filtered.filter(t => t.quadrant !== todo.quadrant || t.completed);
      const reordered = quadrantTodos.map((t, idx) => ({ ...t, order: idx }));
      // Persist new order
      fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: reordered.map((t, idx) => ({ id: t.id, order: idx })) }),
      });
      return [...others, ...reordered];
    });
  }, [todos]);

  // Reorder todo (persisted to DB)
  /**
   * Reorders a todo within a quadrant and persists the new order to the database.
   * - Used for intra-quadrant drag-and-drop.
   * - Updates the order field for all todos in the quadrant to match their new position.
   */
  const reorderTodo = useCallback(async (todoId: string, toQuadrant: QuadrantKey, toIndex: number) => {
    setTodos(prev => {
      const filtered = prev.filter((t) => t.quadrant === toQuadrant && !t.completed);
      const other = prev.filter((t) => t.quadrant !== toQuadrant || t.completed);
      const fromIndex = filtered.findIndex((t) => t.id === todoId);
      if (fromIndex === -1) return prev;
      const [moved] = filtered.splice(fromIndex, 1);
      filtered.splice(toIndex, 0, moved);
      // Update order field for all todos in this quadrant
      // The backend PATCH will persist the new order values
      const updates = filtered.map((t, idx) => ({ id: t.id, order: idx }));
      fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      return [...other, ...filtered];
    });
  }, []);

  /**
   * Reorders all todos in a quadrant and persists the new order to the database.
   * - Used after intra-quadrant reordering or after a cross-quadrant move (to place the moved todo at the end).
   * - Ensures the order field is always correct and unique within the quadrant.
   * - The backend PATCH will persist the new order values.
   */
  const reorderTodosInQuadrant = useCallback(async (quadrant: QuadrantKey, newOrder: Todo[]) => {
    setTodos(prev => {
      const others = prev.filter((t) => t.quadrant !== quadrant);
      // Update order field for all todos in this quadrant
      const updates = newOrder.map((t, idx) => ({ id: t.id, order: idx }));
      fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      return [...others, ...newOrder];
    });
  }, []);

  const value = useMemo(() => ({
    quadrants,
    finished: todos.filter(t => t.completed).sort((a, b) => a.order - b.order),
    addTodo,
    deleteTodo: markCompleted, // soft delete (mark as completed)
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
    pendingMove,
    setPendingMove,
    setTodos,
  }), [quadrants, todos, addTodo, markCompleted, permanentlyDeleteTodo, restoreTodo, toggleTodo, toggleWaiting, updateTodoText, updateTodoDueDate, updateTodoNote, moveTodo, reorderTodo, reorderTodosInQuadrant, pendingMove, setPendingMove, setTodos]);

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
