import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  startOfDay, endOfDay, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfYear, endOfYear, 
  subDays, subWeeks, subMonths, subYears,
  format
} from 'date-fns';

export type DateRangePreset = 
  | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'last_7_days' 
  | 'this_month' | 'last_month' | 'last_30_days' | 'this_quarter' 
  | 'last_quarter' | 'this_year' | 'custom';

interface DateFilterContextType {
  preset: DateRangePreset;
  startDate: Date;
  endDate: Date;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
  getFormattedRange: () => { start: string, end: string };
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const DateFilterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [preset, setPreset] = useState<DateRangePreset>('today');
  const [customStart, setCustomStart] = useState<Date>(startOfDay(new Date()));
  const [customEnd, setCustomEnd] = useState<Date>(endOfDay(new Date()));

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case 'yesterday':
        return { startDate: startOfDay(subDays(now, 1)), endDate: endOfDay(subDays(now, 1)) };
      case 'last_7_days':
        return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
      case 'last_30_days':
        return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
      case 'this_week':
        return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfDay(now) };
      case 'last_week':
        const lastWeek = subWeeks(now, 1);
        return { startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }), endDate: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
      case 'this_month':
        return { startDate: startOfMonth(now), endDate: endOfDay(now) };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
      case 'this_year':
        return { startDate: startOfYear(now), endDate: endOfDay(now) };
      case 'custom':
      default:
        return { startDate: customStart, endDate: customEnd };
    }
  }, [preset, customStart, customEnd]);

  const setCustomRange = (start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
    setPreset('custom');
  };

  const getFormattedRange = () => {
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  return (
    <DateFilterContext.Provider value={{ preset, startDate, endDate, setPreset, setCustomRange, getFormattedRange }}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};
