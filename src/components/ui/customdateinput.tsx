"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DateInputProps {
  id: string;
  name: string;
  value: Date | undefined;
  onChange: (id: string, name: string, date: Date | null) => void;
}

export default function CustomDateInput({ id, name, value, onChange }: DateInputProps) {
  const formattedDate = value ? format(value, "yyyy-MM-dd") : "Select Date";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {formattedDate} <Calendar className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-none rounded-md shadow-none bg-transparent pt-4">
        <DatePicker
          id={id}
          name={name}
          selected={value}
          onChange={(date) => onChange(id, name, date)}
          dateFormat="yyyy-MM-dd"
          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none"
          inline
        />
        
      </PopoverContent>
    </Popover>
  );
}
