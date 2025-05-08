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
import { apiClient } from '@/lib/api';
import { ApiException, ApiResponse } from '@/types/api';

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
  addTodo: (text: string, quadrant: QuadrantKey) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  permanentlyDeleteTodo: (id: string) => Promise<void>;
  restoreTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  toggleWaiting: (id: string) => Promise<void>;
  updateTodoText: (id: string, text: string) => Promise<void>;
  updateTodoDueDate: (id: string, date: Date | null) => Promise<void>;
  updateTodoNote: (id: string, note: string | null) => Promise<void>;
  moveTodo: (todo: Todo, fromQuadrant: QuadrantKey, toQuadrant: QuadrantKey) => Promise<void>;
  reorderTodo: (id: string, newOrder: number) => Promise<void>;
  reorderTodosInQuadrant: (quadrant: QuadrantKey, todos: Todo[]) => Promise<void>;
  pendingMove: { todoId: string; toQuadrant: QuadrantKey } | null;
  setPendingMove: (move: { todoId: string; toQuadrant: QuadrantKey } | null) => void;
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
    dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate || null,
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
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
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
  const [pendingMove, setPendingMove] = useState<{ todoId: string; toQuadrant: QuadrantKey } | null>(null);

  // Helper function to update todos optimistically
  const updateTodosOptimistically = useCallback((updater: (prev: Todo[]) => Todo[]) => {
    setTodos(prev => {
      const updated = updater(prev);
      return updated;
    });
  }, []);

  // Helper function to handle API errors
  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof ApiException) {
      console.error(`API Error: ${error.code} - ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    // Revert optimistic update on error
    setTodos(prev => [...prev]);
  }, []);

  // Helper function to standardize optimistic updates
  const performOptimisticUpdate = useCallback(function<T>(
    optimisticUpdater: (prev: Todo[]) => Todo[],
    apiCall: () => Promise<ApiResponse<T>>,
    onSuccess?: (data: T) => void
  ): Promise<void> {
    return (async () => {
      try {
        // 1. Perform optimistic update
        updateTodosOptimistically(optimisticUpdater);

        // 2. Make API call
        const response = await apiCall();

        // 3. Handle API error
        if (response.error) {
          throw new ApiException(response.error.code, response.error.message);
        }

        // 4. Handle success
        if (onSuccess && response.data) {
          onSuccess(response.data);
        }
      } catch (error) {
        handleApiError(error);
      }
    })();
  }, [updateTodosOptimistically, handleApiError]);

  // Add todo
  const addTodo = useCallback(async (text: string, quadrant: QuadrantKey) => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const newTodo: Todo = {
      id: tempId,
      text,
      quadrant,
      completed: false,
      isWaiting: false,
      createdAt: now,
      order: todos.filter(t => t.quadrant === quadrant).length,
      dueDate: null,
      note: null,
      completedAt: null,
      deleted: null
    };

    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => [...prev, newTodo],
      // API call
      () => apiClient.createTodo({
        text,
        quadrant,
        completed: false,
        isWaiting: false,
        order: todos.filter(t => t.quadrant === quadrant).length,
        dueDate: null,
        note: null,
        completedAt: null,
        deleted: null
      }),
      // Success handler
      (data) => updateTodosOptimistically(prev => 
        prev.map(t => t.id === tempId ? data : t)
      )
    );
  }, [todos, performOptimisticUpdate]);

  // Mark as completed
  const markCompleted = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const completedAt = new Date().toISOString();

    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => {
        const filtered = prev.filter(t => t.id !== id);
        const finished = filtered.filter(t => t.completed);
        const others = filtered.filter(t => !t.completed);
        const newFinishedTask = { ...todo, completed: true, completedAt };
        const newFinished = [newFinishedTask, ...finished].sort((a, b) => {
          const timeA = a.completedAt || '0';
          const timeB = b.completedAt || '0';
          return timeB.localeCompare(timeA);
        });
        return [...others, ...newFinished];
      },
      // API call
      () => apiClient.updateTodo({
        ...todo,
        completed: true,
        completedAt
      }),
      // Success handler
      () => setPendingMove({ todoId: id, toQuadrant: 'finished' })
    );
  }, [todos, performOptimisticUpdate]);

  // Mark as waiting
  const markWaiting = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => prev.map(t => t.id === id ? { ...t, isWaiting: true } : t),
      // API call
      () => apiClient.updateTodo({
        ...todo,
        isWaiting: true
      })
    );
  }, [todos, performOptimisticUpdate]);

  // Mark as not waiting
  const markNotWaiting = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => prev.map(t => t.id === id ? { ...t, isWaiting: false } : t),
      // API call
      () => apiClient.updateTodo({
        ...todo,
        isWaiting: false
      })
    );
  }, [todos, performOptimisticUpdate]);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await performOptimisticUpdate<void>(
      // Optimistic update
      prev => prev.filter(t => t.id !== id),
      // API call
      () => apiClient.deleteTodo(id)
    );
  }, [todos, performOptimisticUpdate]);

  // Restore todo
  const restoreTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Calculate new order based on the number of todos in the target quadrant
    const quadrantTodos = todos.filter(t => t.quadrant === todo.quadrant && !t.completed);
    const newOrder = quadrantTodos.length;

    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => {
        const filtered = prev.filter(t => t.id !== id);
        const quadrantTodos = filtered.filter(t => t.quadrant === todo.quadrant && !t.completed);
        const others = filtered.filter(t => t.quadrant !== todo.quadrant || t.completed);
        const restoredTodo = { 
          ...todo, 
          deleted: false,
          completed: false,
          completedAt: null,
          order: newOrder
        };
        return [...others, ...quadrantTodos, restoredTodo];
      },
      // API call
      () => apiClient.updateTodo({
        ...todo,
        deleted: false,
        completed: false,
        completedAt: null,
        order: newOrder
      })
    );
  }, [todos, performOptimisticUpdate]);

  // Toggle completion
  const toggleTodo = useCallback(async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const isCompleting = !todo.completed;
      const completedAt = isCompleting ? new Date().toISOString() : null;

      // Optimistic update
      updateTodosOptimistically(prev =>
        prev.map(t => t.id === id ? { ...t, completed: isCompleting, completedAt } : t)
      );

      const response = await apiClient.updateTodo({
        ...todo,
        completed: isCompleting,
        completedAt,
      });

      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [todos, updateTodosOptimistically, handleApiError]);

  // Toggle waiting
  const toggleWaiting = useCallback(async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      // Optimistic update
      updateTodosOptimistically(prev =>
        prev.map(t => t.id === id ? { ...t, isWaiting: !t.isWaiting } : t)
      );

      const response = await apiClient.updateTodo({
        ...todo,
        isWaiting: !todo.isWaiting,
      });

      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [todos, updateTodosOptimistically, handleApiError]);

  // Update text
  const updateTodoText = useCallback(async (id: string, text: string) => {
    if (!text.trim()) return;
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      // Optimistic update
      updateTodosOptimistically(prev =>
        prev.map(t => t.id === id ? { ...t, text } : t)
      );

      const response = await apiClient.updateTodo({
        id,
        text,
      });

      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [todos, updateTodosOptimistically, handleApiError]);

  // Update due date
  const updateTodoDueDate = useCallback(async (id: string, date: Date | null) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      // Optimistic update
      updateTodosOptimistically(prev =>
        prev.map(t => t.id === id ? { ...t, dueDate: date } : t)
      );

      const response = await apiClient.updateTodo({
        ...todo,
        dueDate: date,
      });

      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [todos, updateTodosOptimistically, handleApiError]);

  // Update note
  const updateTodoNote = useCallback(async (id: string, note: string | null) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      // Optimistic update
      updateTodosOptimistically(prev =>
        prev.map(t => t.id === id ? { ...t, note } : t)
      );

      const response = await apiClient.updateTodo({
        ...todo,
        note,
      });

      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [todos, updateTodosOptimistically, handleApiError]);

  // Move todo
  const moveTodo = useCallback(async (todo: Todo, fromQuadrant: QuadrantKey, toQuadrant: QuadrantKey) => {
    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => {
        const filtered = prev.filter(t => t.id !== todo.id);
        const quadrantTodos = filtered.filter(t => t.quadrant === toQuadrant);
        const others = filtered.filter(t => t.quadrant !== toQuadrant);
        const newQuadrant = [...quadrantTodos, { ...todo, quadrant: toQuadrant }];
        return [...others, ...newQuadrant];
      },
      // API call
      () => apiClient.updateTodo({
        ...todo,
        quadrant: toQuadrant,
      }),
      // Success handler
      () => setPendingMove({ todoId: todo.id, toQuadrant })
    );
  }, [performOptimisticUpdate]);

  // Reorder todo
  const reorderTodo = useCallback(async (id: string, newOrder: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await performOptimisticUpdate<Todo>(
      // Optimistic update
      prev => prev.map(t => t.id === id ? { ...t, order: newOrder } : t),
      // API call
      () => apiClient.updateTodo({
        ...todo,
        order: newOrder
      })
    );
  }, [todos, performOptimisticUpdate]);

  // Reorder todos within a quadrant
  const reorderTodosInQuadrant = useCallback(async (quadrant: QuadrantKey, todos: Todo[]) => {
    try {
      // Optimistic update
      updateTodosOptimistically(prev =>
        prev.map(t => {
          const updated = todos.find(updated => updated.id === t.id);
          return updated ? { ...t, order: updated.order } : t;
        })
      );

      // API call
      const response = await apiClient.updateTodos(
        todos.map(todo => ({
          id: todo.id,
          order: todo.order,
          completedAt: todo.completedAt || null
        }))
      );

      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [updateTodosOptimistically, handleApiError]);

  // Permanently delete todo
  const permanentlyDeleteTodo = useCallback(async (id: string) => {
    try {
      // Optimistic update
      updateTodosOptimistically(prev => prev.filter(t => t.id !== id));

      const response = await apiClient.deleteTodo(id);
      if (response.error) {
        throw new ApiException(response.error.code, response.error.message);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [updateTodosOptimistically, handleApiError]);

  const value = useMemo(() => ({
    quadrants,
    finished: todos.filter(t => t.completed).sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
      return 0;
    }),
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
    pendingMove,
    setPendingMove,
    setTodos,
  }), [
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
    pendingMove,
    setPendingMove,
    setTodos,
  ]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

/**
 * Custom hook to access the todo context
 * @throws Error if used outside of TodoProvider
 */
export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}
