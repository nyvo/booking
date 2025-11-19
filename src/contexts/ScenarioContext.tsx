import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// DEV ONLY: Scenarios for testing different UI states
export type Scenario =
  | 'normal'        // Default state with some courses/events/bookings
  | 'empty'         // No courses, events, or bookings
  | 'fullyBooked'   // All courses and events are fully booked
  | 'partialBooked' // Some courses/events have spots available
  | 'noCourses'     // Only events, no courses
  | 'noEvents'      // Only courses, no events
  | 'manyStudents'  // Lots of students enrolled
  | 'unpaidBills'   // Many unpaid payments

interface ScenarioContextType {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  isEnabled: boolean;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

const STORAGE_KEY = 'yoga_booking_dev_scenario';

interface ScenarioProviderProps {
  children: ReactNode;
}

export function ScenarioProvider({ children }: ScenarioProviderProps) {
  // Only enable in development mode
  const isEnabled = import.meta.env.MODE === 'development';

  // Initialize from localStorage or default to 'normal'
  const [scenario, setScenarioState] = useState<Scenario>(() => {
    if (!isEnabled) return 'normal';

    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Scenario) || 'normal';
  });

  // Persist scenario changes to localStorage
  const setScenario = (newScenario: Scenario) => {
    if (!isEnabled) return;

    setScenarioState(newScenario);
    localStorage.setItem(STORAGE_KEY, newScenario);

    // Optionally reload to reset mock data
    // window.location.reload();
  };

  // Sync with localStorage changes in other tabs
  useEffect(() => {
    if (!isEnabled) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setScenarioState(e.newValue as Scenario);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isEnabled]);

  // In production, always return 'normal' scenario
  const value: ScenarioContextType = {
    scenario: isEnabled ? scenario : 'normal',
    setScenario,
    isEnabled
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within ScenarioProvider');
  }
  return context;
}

// Helper to check if we should use scenario data
export function useDevScenario(): Scenario | null {
  const context = useContext(ScenarioContext);
  if (!context || !context.isEnabled) {
    return null;
  }
  return context.scenario;
}
