import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

export const formatTime = (time: string | Date): string => {
  try {
    const date = typeof time === 'string' ? parseISO(time) : time;
    return format(date, 'hh:mm a');
  } catch {
    return '--:--';
  }
};

export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const calculateWorkingHours = (clockIn: string, clockOut: string): string => {
  try {
    const start = parseISO(clockIn);
    const end = parseISO(clockOut);
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    return `${hours}h ${minutes}m`;
  } catch {
    return '0h 0m';
  }
};

export const getCurrentTime = (): string => {
  return format(new Date(), 'hh:mm:ss a');
};