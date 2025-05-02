import { QuadrantConfig } from "@/types/todo";

export const QUADRANT_CONFIGS: Record<string, QuadrantConfig> = {
  inbox: {
    key: "inbox",
    title: "INBOX",
    subtitle: "Task List",
    bgColor: "bg-yellow-50",
    gradientColor: "from-yellow-50",
    chevronColor: "text-yellow-600 hover:text-yellow-700",
  },
  urgentImportant: {
    key: "urgentImportant",
    title: "DO NOW",
    subtitle: "Urgent & Important",
    bgColor: "bg-green-50",
    gradientColor: "from-green-50",
    chevronColor: "text-green-600 hover:text-green-700",
  },
  notUrgentImportant: {
    key: "notUrgentImportant",
    title: "SCHEDULE",
    subtitle: "Not Urgent & Important",
    bgColor: "bg-blue-50",
    gradientColor: "from-blue-50",
    chevronColor: "text-blue-600 hover:text-blue-700",
  },
  urgentNotImportant: {
    key: "urgentNotImportant",
    title: "DELEGATE",
    subtitle: "Urgent & Not Important",
    bgColor: "bg-orange-50",
    gradientColor: "from-orange-50",
    chevronColor: "text-orange-600 hover:text-orange-700",
  },
  notUrgentNotImportant: {
    key: "notUrgentNotImportant",
    title: "DELETE",
    subtitle: "Not Urgent & Not Important",
    bgColor: "bg-red-50",
    gradientColor: "from-red-50",
    chevronColor: "text-red-600 hover:text-red-700",
  },
};
