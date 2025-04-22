"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          disabled={(date) => 
            (minDate ? date < minDate : false) || 
            (maxDate ? date > maxDate : false)
          }
        />
      </PopoverContent>
    </Popover>
  )
} 