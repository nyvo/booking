import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value: string | null; // "HH:MM" format, e.g., "09:00"
  onChange: (value: string | null) => void;
  label?: string;
  disabled?: boolean;
  minTime?: string; // "HH:MM"
  maxTime?: string; // "HH:MM"
  intervalMinutes?: number; // default 15
  placeholder?: string;
}

function TimePicker({
  value,
  onChange,
  label,
  disabled = false,
  minTime = "06:00",
  maxTime = "22:00",
  intervalMinutes = 15,
  placeholder = "Velg tid",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Generate time options
  const timeOptions = React.useMemo(() => {
    const times: string[] = [];
    const [minHour, minMinute] = minTime.split(":").map(Number);
    const [maxHour, maxMinute] = maxTime.split(":").map(Number);

    let currentHour = minHour;
    let currentMinute = minMinute;

    while (
      currentHour < maxHour ||
      (currentHour === maxHour && currentMinute <= maxMinute)
    ) {
      const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      times.push(timeString);

      currentMinute += intervalMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return times;
  }, [minTime, maxTime, intervalMinutes]);

  const handleSelectTime = (time: string) => {
    onChange(time);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !value && "text-muted-foreground",
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="start">
          <div
            className="max-h-64 overflow-y-auto p-2 space-y-1"
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => handleSelectTime(time)}
                className={cn(
                  "w-full px-4 py-2 text-sm rounded-md text-left transition-colors",
                  "hover:bg-primary/5",
                  value === time
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground",
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { TimePicker };
export type { TimePickerProps };
