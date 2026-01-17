'use client';

import { useState } from 'react';
import { DayAvailability, TimeSlot, DAYS_FR } from '@/types';

interface Props {
  availability: DayAvailability[];
  onChange: (availability: DayAvailability[]) => void;
}

export default function AvailabilityForm({ availability, onChange }: Props) {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const getDaySlots = (day: number): TimeSlot[] => {
    const dayConfig = availability.find(a => a.day === day);
    return dayConfig?.slots || [];
  };

  const addSlot = (day: number) => {
    const existing = availability.find(a => a.day === day);
    const newSlot: TimeSlot = { start: '09:00', end: '12:00' };

    if (existing) {
      onChange(
        availability.map(a =>
          a.day === day ? { ...a, slots: [...a.slots, newSlot] } : a
        )
      );
    } else {
      onChange([...availability, { day, slots: [newSlot] }]);
    }
  };

  const updateSlot = (day: number, index: number, slot: TimeSlot) => {
    onChange(
      availability.map(a =>
        a.day === day
          ? { ...a, slots: a.slots.map((s, i) => (i === index ? slot : s)) }
          : a
      )
    );
  };

  const removeSlot = (day: number, index: number) => {
    onChange(
      availability
        .map(a =>
          a.day === day
            ? { ...a, slots: a.slots.filter((_, i) => i !== index) }
            : a
        )
        .filter(a => a.slots.length > 0)
    );
  };

  const slots = getDaySlots(selectedDay);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Mes disponibilités</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {DAYS_FR.map((dayName, index) => {
          const hasSlots = getDaySlots(index).length > 0;
          return (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === index
                  ? 'bg-blue-600 text-white'
                  : hasSlots
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {dayName.slice(0, 3)}
              {hasSlots && selectedDay !== index && ' ✓'}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-zinc-700 dark:text-zinc-300">
          {DAYS_FR[selectedDay]}
        </h3>

        {slots.length === 0 ? (
          <p className="text-zinc-500 text-sm">Aucun créneau défini</p>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="time"
                  value={slot.start}
                  onChange={e =>
                    updateSlot(selectedDay, index, {
                      ...slot,
                      start: e.target.value,
                    })
                  }
                  className="px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
                <span className="text-zinc-500">à</span>
                <input
                  type="time"
                  value={slot.end}
                  onChange={e =>
                    updateSlot(selectedDay, index, {
                      ...slot,
                      end: e.target.value,
                    })
                  }
                  className="px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                />
                <button
                  onClick={() => removeSlot(selectedDay, index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => addSlot(selectedDay)}
          className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
        >
          + Ajouter un créneau
        </button>
      </div>
    </div>
  );
}
