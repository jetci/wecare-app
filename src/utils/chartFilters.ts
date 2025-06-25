export type RideData = {
  month?: string;
  week?: string;
  date?: string;
  count?: number;
  users?: number;
};

export const isDateInRange = (d: Date, start: Date, end: Date) =>
  d >= start && d <= end;

export function filterDataByRange<T extends RideData>(
  data: T[],
  dateExtractor: (item: T) => Date,
  start: Date,
  end: Date
): T[] {
  return data.filter((item) => isDateInRange(dateExtractor(item), start, end));
}
