import React, { createContext, useState } from 'react';

export const DaysContext = createContext();

export function DaysProvider({ children }) {
  const [days, setDays] = useState([
    {
      id: '1',
      name: 'Monday',
      CourseName: 'Math',
      hour: '9:00 AM',
      completed: false,
      tasks: ['Review algebra'],
    },
  ]);

  return (
    <DaysContext.Provider value={{ days, setDays }}>
      {children}
    </DaysContext.Provider>
  );
}
