/**
 * NoteModal Component
 *
 * A modal component that provides an interface for adding or editing notes
 * associated with tasks. It includes a textarea for note input and handles
 * saving and canceling operations.
 *
 * Key Features:
 * 1. Note Management:
 *    - Create new notes
 *    - Edit existing notes
 *    - Save changes
 *    - Cancel editing
 *
 * 2. User Interaction:
 *    - Click outside to close
 *    - Escape key to close
 *    - Save and Cancel buttons
 *
 * 3. Visual Design:
 *    - Semi-transparent backdrop
 *    - Centered positioning
 *    - Responsive sizing
 *
 * 4. State Management:
 *    - Local state for note content
 *    - Initial value setting
 *    - Change tracking
 *
 * @component
 * @param {NoteModalProps} props - Component properties
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSave - Callback when note is saved
 * @param {string} props.initialNote - Initial note content
 */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";

interface NoteModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal is closed
  onSave: (note: string) => void; // Callback when note is saved
  initialNote?: string; // Initial note content
}

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote = "",
}: NoteModalProps) {
  // State for managing the note content
  const [note, setNote] = useState(initialNote);

  /**
   * Effect to handle initial note setup and reset
   * - Sets the note content to the initial note if provided
   * - Resets when the modal is reopened
   */
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ADD NOTES"
      className="w-[400px]"
      backgroundClassName="bg-white"
    >
      <div className="flex flex-col m-4">
        <textarea
          value={note ?? ""}
          onChange={(e) => setNote(e.target.value)}
          className="mb-6 p-2 h-[120px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-slate-700 resize-none"
          placeholder="Add a note..."
          autoFocus
        />
        <div className="flex justify-end">
          <button
            onClick={() => onSave(note)}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-base text-white font-bold rounded-full"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
