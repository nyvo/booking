import React, { useState } from "react";
import { useScenario } from "@/contexts/ScenarioContext";
import type { Scenario } from "@/contexts/ScenarioContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2, CheckCircle2 } from "lucide-react";

const scenarios: { value: Scenario; label: string; description: string }[] = [
  {
    value: "normal",
    label: "Normal",
    description: "Standard state with some bookings",
  },
  {
    value: "empty",
    label: "Tom uke",
    description: "Ingen kurs eller arrangementer",
  },
  {
    value: "fullyBooked",
    label: "Fullbooket",
    description: "Alle kurs og arrangementer er fulle",
  },
  {
    value: "partialBooked",
    label: "Delvis booket",
    description: "Noen ledige plasser",
  },
  {
    value: "noCourses",
    label: "Kun arrangementer",
    description: "Ingen kurs, bare arrangementer",
  },
  {
    value: "noEvents",
    label: "Kun kurs",
    description: "Ingen arrangementer, bare kurs",
  },
  {
    value: "manyStudents",
    label: "Mange elever",
    description: "Masse påmeldinger og elever",
  },
  {
    value: "unpaidBills",
    label: "Ubetalte fakturaer",
    description: "Mange ventende betalinger",
  },
];

export function DevScenarioToggle() {
  const { scenario, setScenario, isEnabled } = useScenario();
  const [isOpen, setIsOpen] = useState(false);

  // DEV ONLY: Don't render in production
  if (!isEnabled) {
    return null;
  }

  const currentScenario = scenarios.find((s) => s.value === scenario);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border-primary/20 hover:border-primary/40"
          >
            <Settings2 className="h-3.5 w-3.5 mr-2" />
            <span className="text-xs font-medium">
              Scenario: {currentScenario?.label}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            DEV: Velg scenario for testing
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {scenarios.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => {
                setScenario(item.value);
                // Reload to apply new mock data
                window.location.reload();
              }}
              className="flex items-start gap-2 py-2"
            >
              <div className="flex h-4 w-4 items-center justify-center mt-0.5">
                {scenario === item.value && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">
              Endringer krever refresh av siden
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
