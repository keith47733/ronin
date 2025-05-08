/**
 * Represents the possible quadrants in the Eisenhower Matrix
 * - inbox: Initial location for new tasks
 * - urgentImportant: "DO NOW" quadrant
 * - notUrgentImportant: "SCHEDULE" quadrant
 * - urgentNotImportant: "DELEGATE" quadrant
 * - notUrgentNotImportant: "DON'T DO" quadrant
 */
export type QuadrantKey =
  | "inbox"
  | "urgentImportant"
  | "notUrgentImportant"
  | "urgentNotImportant"
  | "notUrgentNotImportant"
  | "finished";

/**
 * Represents a todo item in the application
 * @property id - Unique identifier for the todo
 * @property text - The content of the todo
 * @property completed - Whether the todo is marked as finished
 * @property isWaiting - Whether the todo is marked as waiting for someone else
 * @property createdAt - When the todo was created
 * @property completedAt - ISO string timestamp of when the todo was completed, or null if not completed
 * @property dueDate - Optional due date for the todo, null if not set
 * @property note - Optional note attached to the todo, null if not set
 * @property quadrant - The current quadrant the todo belongs to
 * @property originalQuadrant - The original quadrant the todo was in
 * @property previousQuadrant - The previous quadrant the todo was in
 * @property deleted - Whether the todo is marked as deleted, null if not deleted
 * @property order - The order of the todo in its quadrant
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isWaiting: boolean;
  createdAt: Date;
  completedAt: string | null;
  quadrant: QuadrantKey;
  dueDate: Date | null;
  note: string | null;
  deleted: boolean | null;
  order: number;
}

export interface DragData {
  todo: Todo;
  fromQuadrant: QuadrantKey;
}

export interface QuadrantConfig {
  key: QuadrantKey;
  title: string;
  subtitle: string;
  bgColor: string;
  headerBgColor: string;
  gradientColor: string;
  chevronColor: string;
}

export interface TodoContextType {
  todos: Todo[];
  quadrants: Record<QuadrantKey, Todo[]>;
  finished: Todo[];
  addTodo: (text: string, quadrant: QuadrantKey) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  toggleWaiting: (id: string) => void;
  updateTodoText: (id: string, text: string) => void;
  updateTodoDueDate: (id: string, date: Date | null) => void;
  updateTodoNote: (id: string, note: string | null) => void;
  moveTodo: (todo: Todo, fromQuadrant: QuadrantKey, toQuadrant: QuadrantKey) => void;
}
