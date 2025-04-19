/**
 * Gets the current year
 * @returns The current year (e.g., 2023)
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Formats a date to a string in the format MM/DD/YYYY
 * @param date The date to format
 * @returns The formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
};

/**
 * Calculates the number of days between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns The number of days between the two dates
 */
export const calculateDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // Include both start and end dates
}; 