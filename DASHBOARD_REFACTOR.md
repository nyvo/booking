# Dashboard Refactor - Oppsummering

## Oversikt

Har ryddet opp i all conditional rendering på dashboard-siden og sentralisert logikken i en ren state-selector funksjon. Dashboardet er nå koblet mot scenario-toggle for enkel testing av ulike tilstander.

---

## Filer som ble lagt til/oppdatert

### 📁 Nye filer

1. **`src/utils/dashboardState.ts`**
   - Inneholder all logikk for filtrering og gruppering av timer
   - Ren funksjon `getDashboardState()` uten sideeffekter
   - Lett å teste og vedlikeholde
   - Definerer `DashboardItem` og `DashboardState` typer

2. **`src/utils/scenarioDashboard.ts`**
   - DEV ONLY: Genererer mock-data for ulike scenarios
   - Funksjon `getScenarioDashboardData(scenario)` 
   - Støtter alle 8 scenarios: empty, normal, fullyBooked, partialBooked, noCourses, noEvents, manyStudents, unpaidBills
   - Holdes separert fra hovedlogikken

### 📝 Oppdaterte filer

3. **`src/pages/teacher/Dashboard.tsx`**
   - Fjernet all inline dato-filtrering og grouping (ca. 70 linjer kode)
   - Bruker nå `getDashboardState()` for all logikk
   - Lagt til `DashboardItemCard` komponent for gjenbruk
   - Integrert scenario-støtte via `useScenario()` hook
   - Conditional rendering forenklet til:
     - Loading state
     - Empty state (ingen timer)
     - Today's focus (har timer i dag)
     - Next upcoming (timer senere denne uken)

---

## Hvordan getDashboardState fungerer

```typescript
function getDashboardState(
  courses: Course[],
  events: Event[],
  referenceDate?: Date
): DashboardState
```

**Prosess:**

1. **Normaliserer dato** - Setter referansedato til midnatt for konsistente sammenligninger
2. **Konverterer** - Alle courses og events → felles `DashboardItem` format
3. **Kombinerer og sorterer** - Slår sammen og sorterer etter dato
4. **Filtrerer upcoming** - Beholder kun timer fra i dag og fremover
5. **Grupperer** - Deler inn i:
   - `todayItems` - Timer i dag
   - `tomorrowItems` - Timer i morgen  
   - `laterThisWeekItems` - Timer senere denne uken (etter i morgen)
6. **Returnerer state** med convenience flags (`hasUpcoming`, `hasToday`, etc.)

**Fordeler:**
- All logikk på ett sted
- Ingen inline conditions i JSX
- Testbar (ren funksjon)
- Type-safe

---

## Hvordan scenario-toggle påvirker dashboardet

### I development-mode:

```typescript
// Dashboard.tsx linje 123-140
const { courses: displayCourses, events: displayEvents } = useMemo(() => {
  if (scenarioEnabled && shouldUseScenarioData()) {
    const scenarioData = getScenarioDashboardData(scenario);
    return {
      courses: scenarioData.courses,
      events: scenarioData.events,
    };
  }
  // Production: use real API data
  return {
    courses: upcomingCourses?.data || [],
    events: upcomingEvents?.data || [],
  };
}, [scenarioEnabled, scenario, upcomingCourses, upcomingEvents]);
```

**Flow:**

1. Bruker velger scenario i DevScenarioToggle (bottom-left hjørne)
2. Scenario lagres i localStorage
3. Dashboard leser scenario via `useScenario()` hook
4. Hvis dev-mode OG scenario er valgt:
   - Bruk `getScenarioDashboardData(scenario)` for mock data
5. Ellers:
   - Bruk ekte API-data fra `useCourses()` og `useEvents()`
6. Data sendes til `getDashboardState()` som vanlig

### I production-mode:
- Scenario system er deaktivert
- Bruker alltid ekte API-data
- Ingen overhead

---

## Hvordan legge til et nytt scenario

### Steg 1: Legg til scenario type
**Fil:** `src/contexts/ScenarioContext.tsx` (linje 4-12)

```typescript
export type Scenario =
  | 'normal'
  | 'empty'
  | 'myNewScenario' // ← Legg til her
  // ...
```

### Steg 2: Implementer scenario data generator
**Fil:** `src/utils/scenarioDashboard.ts` (linje 95+)

```typescript
export function getScenarioDashboardData(scenario: Scenario) {
  switch (scenario) {
    // ... existing cases
    
    case "myNewScenario":
      return {
        courses: [
          generateScenarioCourse(
            "new-course-1",
            "Min nye kurs",
            thisMonday,
            1, // recurringDayOfWeek (Monday)
            10, // enrolledCount
            15, // capacity
          ),
        ],
        events: [
          generateScenarioEvent(
            "new-event-1",
            "Mitt nye arrangement",
            addDays(today, 2),
            5, // bookedCount
            10, // capacity
          ),
        ],
      };
    
    default:
      // ...
  }
}
```

### Steg 3: Legg til i toggle UI (valgfritt)
**Fil:** `src/components/dev/DevScenarioToggle.tsx` (linje 72-83)

```tsx
{scenarios.map((s) => (
  <DropdownMenuItem
    key={s}
    onClick={() => handleScenarioChange(s)}
  >
    {s === scenario && <Check className="mr-2 h-4 w-4" />}
    {s === scenario ? null : <span className="mr-6" />}
    {s}
  </DropdownMenuItem>
))}
```

Scenario-listen genereres automatisk fra `Scenario` type.

### Steg 4: Test
1. Kjør app i dev-mode: `npm run dev`
2. Åpne dashboard
3. Klikk på scenario-toggle (bottom-left)
4. Velg ditt nye scenario
5. Verifiser at riktig data vises

**Tips:**
- Bruk `generateScenarioCourse()` og `generateScenarioEvent()` for konsistente mock-objekter
- Test edge cases:
  - Tomt array (ingen timer)
  - Timer kun i dag
  - Timer kun i morgen
  - Fullbookede vs ledige plasser
  - Past events (for testing "tidligere" tilstander)

---

## Testing guide

### Alle scenarios å teste:

| Scenario | Forventet resultat |
|----------|-------------------|
| **empty** | "Du har ingen timer denne uken" + CTA knapp |
| **normal** | 3 kurs + 2 events, godt spredt denne uken |
| **fullyBooked** | Alle kurs/events viser full kapasitet (12/12, 20/20, etc.) |
| **partialBooked** | Kurs/events med ledige plasser |
| **noCourses** | Kun "Arrangement" badges, ingen "Kurs" badges |
| **noEvents** | Kun "Kurs" badges, flere kurs vises |
| **manyStudents** | Høye tall på deltakere (18/20, 45/50, etc.) |
| **unpaidBills** | Samme visning som normal (betalinger påvirker ikke dashboard UI) |

### Manuelle test-steps:

1. ✅ Start dev server: `npm run dev`
2. ✅ Naviger til `/teacher/dashboard`
3. ✅ Åpne DevScenarioToggle (bottom-left)
4. ✅ Gå gjennom hver scenario og verifiser:
   - Loading state vises først
   - Riktig data vises for scenarioet
   - Gruppering ("I dag", "I morgen", "Senere denne uken") fungerer
   - Enrollment counts stemmer
   - CTA knapper vises når relevant
5. ✅ Bytt tilbake til "normal" og verifiser at det fungerer

---

## Arkitektur-prinsipper brukt

### ✅ Separation of Concerns
- **UI Layer** (Dashboard.tsx): Kun presentasjon, ingen business logic
- **State Layer** (dashboardState.ts): All filtrering og grouping
- **Data Layer** (scenarioDashboard.ts): Mock data generation

### ✅ Single Responsibility
- `getDashboardState()`: Transformer rådata til UI-state
- `getScenarioDashboardData()`: Generer scenario-spesifikk data
- `DashboardItemCard`: Reusable card komponent

### ✅ Pure Functions
- Ingen sideeffekter i `getDashboardState()`
- Lett å teste og reason about
- Deterministisk output

### ✅ Type Safety
- Definerte `DashboardItem` og `DashboardState` typer
- TypeScript sikrer korrekt bruk
- Compile-time errors vs runtime errors

### ✅ DRY (Don't Repeat Yourself)
- Reusable `DashboardItemCard` komponent
- Helper functions for scenario data generation
- Sentralisert conditional rendering logic

---

## Fremtidige forbedringer (valgfritt)

1. **Unit tests** for `getDashboardState()`
   - Test edge cases (tomme arrays, past dates, etc.)
   - Snapshot testing for state output

2. **Visual regression tests** for scenarios
   - Screenshot hver scenario
   - Automatisk sammenligne mot baseline

3. **Storybook integration**
   - Isoler DashboardItemCard
   - Test alle variants

4. **Performance optimizations**
   - Memoize `DashboardItemCard` med React.memo
   - Virtualized lists for mange items

5. **Accessibility**
   - ARIA labels for screen readers
   - Keyboard navigation i scenario toggle

---

## Vedlikehold

### Når du legger til nye felt i Course/Event:
1. Oppdater `DashboardItem` type i `dashboardState.ts`
2. Oppdater `courseToDashboardItem()` og `eventToDashboardItem()`
3. Oppdater `DashboardItemCard` hvis UI skal vise nytt felt

### Når du endrer filter-logikk:
- All logikk er i `getDashboardState()` → endre kun der
- Ingen endringer nødvendig i Dashboard.tsx

### Når du legger til nye scenarios:
- Følg "Hvordan legge til et nytt scenario" over
- Husk å teste alle edge cases

---

## Kjente issues / TODOs

- [ ] Fikse Course.endDate bug i classService.ts (bruker ikke-eksisterende felt)
- [ ] Vurdere å legge til "Neste uke" gruppe i tillegg til "Senere denne uken"
- [ ] Eksportere scenario data til JSON for reproduserbare tests

---

**Dato for refactor:** Januar 2025  
**TypeScript versjon:** ✅ Kompilerer uten feil  
**Testing status:** ✅ Manuelle tests OK
