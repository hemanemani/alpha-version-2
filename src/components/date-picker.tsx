"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  onBlur?: () => void
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "Select date",
  disabled = false,
  required = false,
  name,
  onBlur,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>(date ? format(date, "dd-MM-yyyy") : "")
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Update input value when date changes externally
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "dd-MM-yyyy"))
    } else {
      setInputValue("")
    }
  }, [date])

  // Replace the handleInputChange function with this improved version that auto-formats
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get only the numeric values from input
    const numericValue = e.target.value.replace(/\D/g, "")
    setError(null)

    // If empty, clear the date
    if (!numericValue) {
      setInputValue("")
      setDate(undefined)
      return
    }

    // Format the input as DD-MM-YYYY as the user types
    let formattedValue = ""
    if (numericValue.length <= 2) {
      // Just the day
      formattedValue = numericValue
    } else if (numericValue.length <= 4) {
      // Day and partial/full month
      formattedValue = `${numericValue.slice(0, 2)}-${numericValue.slice(2)}`
    } else {
      // Day, month, and year
      formattedValue = `${numericValue.slice(0, 2)}-${numericValue.slice(2, 4)}-${numericValue.slice(4, 8)}`
    }

    setInputValue(formattedValue)

    // Try to parse the date if we have enough digits for a complete date
    if (numericValue.length === 8) {
      const day = numericValue.slice(0, 2)
      const month = numericValue.slice(2, 4)
      const year = numericValue.slice(4, 8)
      const dateString = `${day}-${month}-${year}`

      const parsedDate = parse(dateString, "dd-MM-yyyy", new Date())

      if (isValid(parsedDate)) {
        setDate(parsedDate)
      } else {
        setError("Invalid date. Please check the values.")
      }
    }
  }

  // Handle calendar selection
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setInputValue(format(selectedDate, "dd-MM-yyyy"))
    }
    setOpen(false)
  }

  // Handle input blur
  const handleBlur = () => {
    // Validate date on blur
    if (inputValue && inputValue.length > 0) {
      const parsedDate = parse(inputValue, "dd-MM-yyyy", new Date())

      if (!isValid(parsedDate)) {
        setError("Invalid date format. Use DD-MM-YYYY")
      }
    }

    if (onBlur) onBlur()
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            name={name}
            className={cn("pr-10", error ? "border-destructive" : "", "focus:ring-primary")}
            aria-invalid={error ? "true" : "false"}
          />
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "absolute right-0 h-full px-3 py-2 border-l",
                disabled ? "cursor-not-allowed opacity-50" : "",
              )}
              disabled={disabled}
              type="button"
              onClick={() => setOpen(true)}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Open calendar</span>
            </Button>
          </PopoverTrigger>
        </div>
        {/* Replace the PopoverContent section to ensure the calendar opens with the current date selected */}
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            defaultMonth={date} // Add this line to ensure calendar opens on the current month
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-destructive text-sm mt-1 absolute">{error}</p>}
    </div>
  )
}

