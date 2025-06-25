import { useState } from "react";

export type Filters = {
  dateRange: { start: Date; end: Date };
  rideType?: string;
};

export const useExecutiveFilters = (
  initial: Filters,
  onChange: (f: Filters) => void
) => {
  const [filters, setFilters] = useState<Filters>(initial);

  const updateFilter = (updated: Partial<Filters>) => {
    const newFilters = { ...filters, ...updated };
    setFilters(newFilters);
    onChange(newFilters);
  };

  return {
    filters,
    setDateRange: (range: { start: Date; end: Date }) =>
      updateFilter({ dateRange: range }),
    setRideType: (type?: string) => updateFilter({ rideType: type }),
  };
};
