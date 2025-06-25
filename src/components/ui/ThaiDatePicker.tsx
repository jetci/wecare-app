import React, { ComponentProps } from 'react';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale/th';

// Register Thai locale
registerLocale('th', th);

// Thai month names
const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

type ThaiDatePickerProps = ComponentProps<typeof DatePicker>;

export default function ThaiDatePicker(props: ThaiDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100;
  const endYear = currentYear + 10;
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);
  return (
    <DatePicker
      {...props}
      locale="th"
      dateFormat="dd/MM/yyyy"
      renderCustomHeader={({ date, changeMonth, changeYear, decreaseMonth, increaseMonth }) => (
        <div className="flex justify-center items-center px-2 py-1 bg-white">
          <button type="button" onClick={decreaseMonth}>{'<'}</button>
          <select
            value={date.getMonth()}
            onChange={e => changeMonth(Number(e.target.value))}
          >
            {thaiMonths.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            value={date.getFullYear()}
            onChange={e => changeYear(Number(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y + 543}</option>)}
          </select>
          <button type="button" onClick={increaseMonth}>{'>'}</button>
        </div>
      )}
    />
  );
}
