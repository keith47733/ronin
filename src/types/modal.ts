import { Todo } from "./todo";

export type ModalType = "dueDate" | "note" | "finished" | null;

export interface TriggerPosition {
  x: number;
  y: number;
}

export interface DueDateModalData {
  todoId: string;
  quadrant: string;
  initialDate?: Date;
  triggerPosition?: TriggerPosition;
}

export interface NoteModalData {
  todoId: string;
  quadrant: string;
  initialNote?: string;
  triggerPosition?: TriggerPosition;
}

export interface FinishedModalData {
  todos: Todo[];
}

export type ModalData =
  | DueDateModalData
  | NoteModalData
  | FinishedModalData
  | undefined;
