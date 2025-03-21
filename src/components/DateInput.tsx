"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { DayPicker } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateInputProps {
  id: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string;
  name?: string;

}

export function DateInput({ id, value, onChange, name }: DateInputProps) {
  const [inputValue, setInputValue] = useState(value ? format(value, "dd-MM-yyyy") : "")
  const [month, setMonth] = useState<Date>(value || new Date())

  const formatDateString = useCallback((input: string) => {
    const digitsOnly = input.replace(/\D/g, "")

    let formattedDate = ""
    for (let i = 0; i < digitsOnly.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formattedDate += "-"
      }
      formattedDate += digitsOnly[i]
    }

    const parts = formattedDate.split("-")
    if (parts[0] && Number.parseInt(parts[0]) > 31) parts[0] = "31"
    if (parts[1] && Number.parseInt(parts[1]) > 12) parts[1] = "12"

    return parts.join("-")
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatDateString(e.target.value)
    setInputValue(newValue)

    if (newValue.length === 10) {
      const parsedDate = parse(newValue, "dd-MM-yyyy", new Date())
      if (isValid(parsedDate)) {
        onChange(parsedDate)
        setMonth(parsedDate)
      } else {
        onChange(undefined)
      }
    } else {
      onChange(undefined)
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date)
    setInputValue(date ? format(date, "dd-MM-yyyy") : "")
    if (date) setMonth(date)
  }

  const years = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - 50 + i)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="relative">
      <Input id={id} value={inputValue} onChange={handleInputChange} placeholder="DD-MM-YYYY" name={name} />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"} className="absolute right-0 top-0 h-full px-3" type="button">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="flex justify-between items-center p-2">
            <Select
              value={month.getFullYear().toString()}
              onValueChange={(year) => setMonth(new Date(Number.parseInt(year), month.getMonth()))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={month.getMonth().toString()}
              onValueChange={(monthIndex) => setMonth(new Date(month.getFullYear(), Number.parseInt(monthIndex)))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={monthName} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            month={month}
            onMonthChange={setMonth}
            showOutsideDays
            className="p-3"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            // components={{
            //   IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
            //   IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
            // }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

