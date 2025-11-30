import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, dd MMM yyyy', { locale: id });
    // Output: "Senin, 15 Jan 2025"
  } catch (error) {
    return dateString;
  }
};

export const formatDateForApi = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
  // Output: "2025-01-15"
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
    // Output: "15 Jan 2025, 14:30"
  } catch (error) {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy', { locale: id });
    // Output: "15 Jan 2025"
  } catch (error) {
    return dateString;
  }
};
