// Quadrant configuration constants for the Eisenhower Matrix UI.
// Each quadrant (and the finished list) has a config for title, subtitle, colors, and chevron styles.
// This pattern centralizes UI config for consistency and easy updates.
import { QuadrantConfig } from "@/types/todo";

export const QUADRANT_CONFIGS: Record<string, QuadrantConfig> = {
  inbox: {
    key: "inbox",
    title: "INBOX",
    subtitle: "Task List",
    headerBgColor: "bg-yellow-100",
    bgColor: "bg-yellow-100",
    gradientColor: "from-yellow-100",
    chevronColor: "text-yellow-600 hover:text-yellow-700",
  },
  urgentImportant: {
    key: "urgentImportant",
    title: "DO NOW",
    subtitle: "Urgent & Important",
    headerBgColor: "bg-green-100",
    bgColor: "bg-green-100",
    gradientColor: "from-green-100",
    chevronColor: "text-green-600 hover:text-green-700",
  },
  notUrgentImportant: {
    key: "notUrgentImportant",
    title: "SCHEDULE",
    subtitle: "Not Urgent & Important",
    headerBgColor: "bg-blue-100",
    bgColor: "bg-blue-100",
    gradientColor: "from-blue-100",
    chevronColor: "text-blue-600 hover:text-blue-700",
  },
  urgentNotImportant: {
    key: "urgentNotImportant",
    title: "DELEGATE",
    subtitle: "Urgent & Not Important",
    headerBgColor: "bg-purple-100",
    bgColor: "bg-purple-100",
    gradientColor: "from-purple-100",
    chevronColor: "text-purple-600 hover:text-purple-700",
  },
  notUrgentNotImportant: {
    key: "notUrgentNotImportant",
    title: "DELETE",
    subtitle: "Not Urgent & Not Important",
    headerBgColor: "bg-orange-100",
    bgColor: "bg-orange-100",
    gradientColor: "from-orange-100",
    chevronColor: "text-orange-600 hover:text-orange-700",
  },
  finished: {
    key: "finished",
    title: "FINISHED TASKS",
    subtitle: "Completed tasks",
    headerBgColor: "bg-red-100",
    bgColor: "bg-red-100",
    gradientColor: "from-red-100 to-transparent",
    chevronColor: "text-red-600 hover:text-red-700",
  },
};
