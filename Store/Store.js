import { create } from "zustand";

export const StoreForDay = create((set, get) => ({
  days: [
    // Örnek başlangıç verisi
    {
      id: "1",
      name: "Monday",
      CourseName: "Math",
      hour: "10:00",
      completed: false,
      attended: false,
      tasks: ["Task 1", "Task 2"],
    },
  ],

  AddNewDay: (day) =>
    set((state) => ({
      days: [...state.days, day],
    })),

  SetDays: (newDays) => set(() => ({ days: newDays })),

  toggleAttendance: (id, value) => {
    const days = get().days.map((day) =>
      day.id === id
        ? { ...day, attended: value, completed: value }
        : day
    );
    set({ days });
  },
}));
