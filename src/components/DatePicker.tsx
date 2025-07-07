import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const DatePicker = ({ value, onChange, placeholder = "اختر التاريخ" }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  
  // Fix: Properly handle date parsing and validation
  const selectedDate = value && value.trim() ? (() => {
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  })() : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Fix: Ensure proper date formatting
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
    setOpen(false);
  };

  const formatDisplayDate = (date: Date) => {
    try {
      return format(date, "dd MMMM yyyy", { locale: ar });
    } catch {
      return format(date, "dd/MM/yyyy");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors",
            !selectedDate && "text-gray-500 dark:text-gray-400"
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" 
        align="start"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          initialFocus
          className="text-gray-800 dark:text-gray-200"
          classNames={{
            day_selected: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
            day_today: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
            day: "hover:bg-gray-100 dark:hover:bg-gray-700",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;