
import { useState } from "react";
import { format } from "date-fns";
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
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString().split('T')[0]);
    } else {
      onChange('');
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg hover:bg-slate-600/50",
            !selectedDate && "text-slate-400"
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd/MM/yyyy")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-800 border border-slate-600 rounded-lg shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
          className="pointer-events-auto text-slate-200"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
