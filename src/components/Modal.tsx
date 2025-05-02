import React, { useRef, useEffect, CSSProperties } from "react";
import { XCircle } from "lucide-react";

/**
 * Modal Component
 *
 * A reusable modal dialog component that provides a consistent interface for displaying
 * content in a popup window. Features include:
 * - Customizable title and content
 * - Keyboard navigation (Escape to close)
 * - Custom positioning and styling
 * - Semi-transparent backdrop with blur effect
 * - Responsive design
 * - Accessibility support
 *
 * @component
 * @param {ModalProps} props - Component properties
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.CSSProperties} [props.style] - Additional inline styles
 * @param {Object} [props.triggerPosition] - Position of the trigger element
 */

interface ModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal is closed
  title: string; // Modal title text
  children: React.ReactNode; // Modal content
  className?: string; // Additional CSS classes
  style?: CSSProperties; // Additional inline styles
  triggerPosition?: { x: number; y: number };
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  style,
  triggerPosition,
}: ModalProps) {
  // Reference to the modal container for DOM operations
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to handle keyboard navigation and click outside
   * - Adds event listener for Escape key to close modal
   * - Adds event listener for click outside to close modal
   * - Prevents event propagation to elements behind modal
   * - Cleans up event listeners when modal closes
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore scrolling when modal is closed
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Return null if modal is not open
  if (!isOpen) return null;

  // Position the modal
  const modalStyle: CSSProperties = triggerPosition
    ? {
        position: "fixed",
        top: triggerPosition.y + 10,
        left: triggerPosition.x,
        transform: "translateX(-50%)",
        zIndex: 51,
        ...style,
      }
    : style
    ? {
        position: "fixed",
        zIndex: 51,
        ...style,
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 51,
      };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl ${className}`}
        style={modalStyle}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-lg">
          <h2 className="text-lg title px-4 text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
