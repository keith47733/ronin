"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "./Modal";

/**
 * DueDateModal Component
 *
 * A modal component that provides a date picker interface for setting due dates on todo items.
 * Features include:
 * - Inline calendar display
 * - Quick selection of today and tomorrow
 * - Custom styling for better visual integration
 * - Keyboard navigation support
 *
 * @component
 * @param {DueDateModalProps} props - Component properties
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSave - Callback when a date is selected
 * @param {Date} [props.initialDate] - Initial date to display in the picker
 */

/**
 * Props interface for the DueDateModal component
 */
interface DueDateModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal is closed
  onSave: (date: Date | undefined) => void; // Callback when date is saved
  initialDate?: Date; // Optional initial date to display
}

export default function DueDateModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
}: DueDateModalProps) {
  // State for managing the selected date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate
  );

  /**
   * Effect to handle initial date setup and reset
   * - Sets the selected date to the initial date if provided
   * - Otherwise sets it to today's date
   * - Resets when the modal is reopened
   */
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);
    }
  }, [initialDate, isOpen]);

  /**
   * Handles date selection changes from the DatePicker
   * @param {Date | null} date - The selected date or null if cleared
   */
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date || undefined);
  };

  /**
   * Checks if a given date is today
   * @param {Date} date - The date to check
   * @returns {boolean} True if the date is today
   */
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Checks if a given date is tomorrow
   * @param {Date} date - The date to check
   * @returns {boolean} True if the date is tomorrow
   */
  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SET DUE DATE"
      className="w-[300px]"
      backgroundClassName="bg-white"
    >
      <div className="flex flex-col gap-2 pt-1 pb-0 bg-white">
        <div className="w-full flex justify-center text-sm">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            calendarClassName="border-0 shadow-none text-sm"
            dayClassName={(date) =>
              date.getTime() === selectedDate?.getTime()
                ? "bg-blue-500 text-white hover:bg-blue-600 text-sm"
                : "hover:bg-gray-100 text-sm"
            }
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setSelectedDate(today);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedDate && isToday(selectedDate)
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                setSelectedDate(tomorrow);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedDate && isTomorrow(selectedDate)
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tomorrow
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onSave(selectedDate)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
