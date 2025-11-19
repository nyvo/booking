# Development Scenario Toggle

## Overview

The development scenario toggle is a dev-only feature that allows you to quickly switch between different UI states for testing and design purposes. It's only visible in development mode and does not affect production builds.

## How to Use

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Look for the scenario toggle button:**
   - Located at the **bottom-left corner** of the screen
   - Shows current scenario (e.g., "Scenario: Normal")
   - Only visible when `NODE_ENV === 'development'`

3. **Click to open the scenario menu:**
   - Choose from available scenarios
   - Page will reload with the selected mock data

## Available Scenarios

### `normal` (Default)
Standard state with the default mock data from the codebase.

### `empty`
- No courses
- No events  
- No bookings
- Empty dashboard
- Perfect for testing empty states

### `fullyBooked`
- All courses at maximum capacity
- All events sold out
- Mix of paid and pending payments
- Good for testing "no availability" UI

### `partialBooked`
- Some courses with available spots
- Mix of full and available events
- Various payment statuses
- Good for testing mixed states

### `noCourses`
- Only events, no courses
- Various event types
- Good for testing event-only scenarios

### `noEvents`
- Only courses, no events
- Mix of course types and schedules
- Good for testing course-focused views

### `manyStudents`
- Large number of enrolled students
- Popular classes near capacity
- Good for testing pagination and lists

### `unpaidBills`
- Many unpaid/overdue payments
- Past-due invoices
- Good for testing payment reminder UI

## Technical Details

### Architecture

```
src/
├── contexts/
│   └── ScenarioContext.tsx      # Global scenario state management
├── components/
│   └── dev/
│       └── DevScenarioToggle.tsx # UI toggle component
└── mock-data/
    └── scenarios.ts              # Scenario-specific data generators
```

### How It Works

1. **ScenarioContext** provides global state management:
   - Stores current scenario in localStorage
   - Only active when `import.meta.env.MODE === 'development'`
   - Wraps entire app in App.tsx

2. **DevScenarioToggle** provides the UI:
   - Floating button with dropdown menu
   - Automatically hidden in production
   - Triggers page reload on scenario change

3. **Service Layer Integration**:
   - `classService.ts`, `bookingService.ts`, and `userService.ts` check for active scenarios
   - When a scenario is active, they return scenario-specific data
   - Falls back to normal mock data when no scenario is set

### Production Safety

- **Environment Check**: All scenario code checks `import.meta.env.MODE === 'development'`
- **No Production Bundle**: Vite tree-shakes dev-only code in production builds
- **Graceful Fallback**: If accessed in production, always returns 'normal' scenario

## Adding New Scenarios

1. **Add scenario type** to `ScenarioContext.tsx`:
   ```typescript
   export type Scenario = 
     | 'normal'
     | 'empty'
     | 'yourNewScenario'  // Add here
   ```

2. **Add UI option** in `DevScenarioToggle.tsx`:
   ```typescript
   const scenarios = [
     // ... existing scenarios
     { 
       value: 'yourNewScenario', 
       label: 'Your Label', 
       description: 'Description' 
     }
   ];
   ```

3. **Generate data** in `mock-data/scenarios.ts`:
   ```typescript
   case 'yourNewScenario': {
     return {
       courses: [...],  // Your custom courses
       events: [...],   // Your custom events
       bookings: [...], // Your custom bookings
       payments: [...], // Your custom payments
       students: [...]  // Your custom students
     };
   }
   ```

## Files Modified

### Core Files
- `src/contexts/ScenarioContext.tsx` - Created scenario context provider
- `src/components/dev/DevScenarioToggle.tsx` - Created UI toggle component
- `src/mock-data/scenarios.ts` - Created scenario data generators
- `src/App.tsx` - Added ScenarioProvider wrapper

### Service Layer
- `src/services/classService.ts` - Added scenario data checks for courses/events
- `src/services/bookingService.ts` - Added scenario data checks for bookings/payments
- `src/services/userService.ts` - Added scenario data checks for students

### Layout Components
- `src/components/layout/TeacherLayout.tsx` - Added DevScenarioToggle component
- `src/components/layout/StudentLayout.tsx` - Added DevScenarioToggle component

## Constraints & Design Decisions

1. **Minimal footprint**: No heavy dependencies, uses existing UI components
2. **Consistent design**: Uses your existing Tailwind classes and shadcn/ui components
3. **Non-intrusive**: Small floating button that doesn't interfere with page layout
4. **Persistent selection**: Stores in localStorage to survive page reloads
5. **Page reload required**: Simplest approach to reset all component states

## Troubleshooting

### Scenario not applying?
- Check browser console for errors
- Verify localStorage has `yoga_booking_dev_scenario` key
- Try hard refresh (Ctrl+Shift+R)

### Toggle not visible?
- Ensure you're running in development mode (`npm run dev`)
- Check that you're logged in (teacher or student role)
- Verify App.tsx has ScenarioProvider wrapper

### Data not changing?
- Some scenarios might look similar for certain pages
- Try switching between extreme scenarios (empty ↔ fullyBooked)
- Check the specific page supports scenario data