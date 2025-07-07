import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [isValidDate, setIsValidDate] = useState(true);
  
  // Memoize selectedDate to prevent unnecessary recalculations
  const selectedDate = useMemo(() => {
    if (!value || !value.trim()) {
      return undefined;
    }
    
    try {
      // Try parsing as ISO string first
      if (value.includes('-')) {
        const date = parseISO(value);
        return isValid(date) ? date : undefined;
      }
      // Fallback to Date constructor
      const date = new Date(value);
      return isValid(date) ? date : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  // Handle validation separately in useEffect
  useEffect(() => {
    if (!value || !value.trim()) {
      setIsValidDate(true);
    } else {
      const isValid = selectedDate !== undefined;
      setIsValidDate(isValid);
    }
  }, [value, selectedDate]);

  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      // Format date as YYYY-MM-DD for consistent storage
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
      setIsValidDate(true);
    } else {
      onChange('');
      setIsValidDate(false);
    }
    setOpen(false);
  };

  const formatDisplayDate = (date: Date) => {
    try {
      // Use Arabic locale for better RTL support
      return format(date, "dd MMMM yyyy", { locale: ar });
    } catch {
      // Fallback to simple format if Arabic formatting fails
      return format(date, "dd/MM/yyyy");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal py-3 px-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md arabic-text min-h-[48px]",
            !selectedDate && "text-gray-500 dark:text-gray-400",
            !isValidDate && "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20",
            open && "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-gray-700"
          )}
          style={{ direction: 'rtl', textAlign: 'right' }}
        >
          <div className="flex items-center gap-3 w-full">
            <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="truncate text-sm font-medium">
              {selectedDate && isValidDate ? formatDisplayDate(selectedDate) : placeholder}
            </span>
            {selectedDate && (
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] sm:w-[320px] p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl z-50" 
        align="start"
        sideOffset={8}
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 text-center">
            اختر تاريخ الانتهاء
          </h3>
        </div>
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
          className="text-gray-800 dark:text-gray-200 p-4"
          classNames={{
            months: "flex flex-col space-y-4",
            month: "space-y-4",
            caption: "flex flex-col items-center pt-1 relative",
            caption_label: "text-base font-semibold text-gray-900 dark:text-gray-100 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-3 w-full text-center",
            nav: "flex items-center justify-center gap-3 mt-2",
            nav_button: "h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 p-0 opacity-90 hover:opacity-100 border-0 rounded-xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center text-white hover:scale-105",
            nav_button_previous: "",
            nav_button_next: "",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 dark:text-gray-400 rounded-lg w-9 h-9 sm:w-10 sm:h-10 font-medium text-xs sm:text-sm flex items-center justify-center",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 sm:h-10 sm:w-10 text-center text-xs sm:text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
            day: "h-9 w-9 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center hover:scale-105 text-xs sm:text-sm",
            day_selected: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 font-semibold shadow-lg",
            day_today: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold border-2 border-blue-300 dark:border-blue-500",
            day_disabled: "text-gray-300 dark:text-gray-600 opacity-50 cursor-not-allowed",
            day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
          }}
          components={{
            IconLeft: ({ ...props }) => (
              <div className="flex items-center justify-center w-full h-full">
                <ChevronRight className="h-5 w-5" {...props} />
              </div>
            ),
            IconRight: ({ ...props }) => (
              <div className="flex items-center justify-center w-full h-full">
                <ChevronLeft className="h-5 w-5" {...props} />
              </div>
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;