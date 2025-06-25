import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  startDate: Date;
  endDate: Date;
  onChange: (range: { start: Date; end: Date }) => void;
};

export const DateRangePicker: React.FC<Props> = ({ startDate, endDate, onChange }) => (
  <div className="flex items-center gap-2" aria-label="Date range filter">
    <DatePicker
      selected={startDate}
      onChange={(date: Date | null) => date && onChange({ start: date, end: endDate })}
      selectsStart
      startDate={startDate}
      endDate={endDate}
      aria-label="เลือกวันเริ่มต้น"
    />
    <span aria-hidden="true">–</span>
    <DatePicker
      selected={endDate}
      onChange={(date: Date | null) => date && onChange({ start: startDate, end: date })}
      selectsEnd
      startDate={startDate}
      endDate={endDate}
      minDate={startDate}
      aria-label="เลือกวันสิ้นสุด"
    />
  </div>
);
