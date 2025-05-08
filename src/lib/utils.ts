// Utility function for combining Tailwind and conditional class names in React components.
// Uses clsx for conditional logic and tailwind-merge to resolve conflicting Tailwind classes.
// Usage: cn('p-2', isActive && 'bg-blue-500', customClass)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
