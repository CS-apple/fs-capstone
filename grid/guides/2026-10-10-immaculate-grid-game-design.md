# Roast Battle League: Immaculate Grid Game Specification & Design

**Target Audience:** Development Team (Junior Engineers & Implementers)  
**Goal:** Build a daily 3x3 interactive "Immaculate Grid" trivia game for the Roast Battle League where fans test their comedy knowledge by matching comedians to intersections of cities, opponents, venues, and career records. Players do not need to log in to play, but their current game state and career statistics must persist locally.

---

## 1. Game Concept & Rules

### 1.1 The Board
* A **3x3 grid** with 3 Row Categories and 3 Column Categories (9 cells total).
* Players have a maximum of **9 guesses** to complete the grid (1 guess per cell).
* Every guess counts against the total 9 guesses, whether correct or incorrect.

```
                  [ Column A ]             [ Column B ]             [ Column C ]
            ┌────────────────────────┬────────────────────────┬────────────────────────┐
 [ Row 1 ]  │  Comic who fits        │  Comic who fits        │  Comic who fits        │
            │  Row 1 AND Col A       │  Row 1 AND Col B       │  Row 1 AND Col C       │
            ├────────────────────────┼────────────────────────┼────────────────────────┤
 [ Row 2 ]  │  Comic who fits        │  Comic who fits        │  Comic who fits        │
            │  Row 2 AND Col A       │  Row 2 AND Col B       │  Row 2 AND Col C       │
            ├────────────────────────┼────────────────────────┼────────────────────────┤
 [ Row 3 ]  │  Comic who fits        │  Comic who fits        │  Comic who fits        │
            │  Row 3 AND Col A       │  Row 3 AND Col B       │  Row 3 AND Col C       │
            └────────────────────────┴────────────────────────┴────────────────────────┘
```

### 1.2 Core Rules
1. **Intersection Validation:** A chosen comedian is valid for a cell if and only if they satisfy **both** the corresponding row category and column category.
2. **Single-Use Rule:** A comedian can only be used **once** per board. Once a comic has been placed in a cell, they cannot be used in another cell even if they qualify.
3. **No Retries on Cells:** If a guess is incorrect, that cell remains empty or marked failed, and the player loses 1 of their 9 guesses.
4. **Daily Puzzle Format:** Every day features a new daily grid. Players can also play randomly generated practice boards.

---

## 2. Category System & Data Mapping

All category validation queries the public tables in the database:
- `battlers` (Comedians)
- `matches` (Head-to-head battle outcomes)
- `shows` (Dates, venues, and cities)
- `cities` & `locations` (Metropolitan divisions & venues)
- `rbl_points` (Season points)

### Supported Category Types

| Category Type | Description | Database Query Logic |
|---|---|---|
| **City** | Fought in a specific city (e.g. *New York*, *Austin*, *Los Angeles*) | Comedian is in `matches` linked via `shows` where `shows.city_id = target_city_id` OR `battlers.city_id = target_city_id`. |
| **Venue** | Fought at a specific venue (e.g. *The Grove*, *New York Comedy Club*) | Comedian is in `matches` on a show where `shows.location_id = target_location_id`. |
| **Opponent** | Has battled a specific comedian (e.g. *Has fought Dan Wickes*) | Match exists where `(battler_1_id = comic_id AND battler_2_id = opponent_id) OR (battler_2_id = comic_id AND battler_1_id = opponent_id)`. |
| **Career Wins** | Reached a win threshold (e.g. *5+ Career Wins*, *10+ Career Wins*) | `battler.calculatedWins >= target` OR `battler.wins >= target`. |
| **Points** | Total career or season points (e.g. *100+ RBL Points*) | `battler.calculatedPoints >= target` OR sum of `rbl_points.points >= target`. |
| **Undefeated / Win Rate** | Strong record (e.g. *Win Rate >= 75%* with min 3 matches) | `totalMatches >= 3 AND (wins / totalMatches) >= 0.75`. |

---

## 3. Architecture & User Experience

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            IMMACULATE GRID UI                               │
│                                                                             │
│  /fantasy/grid  (or /grid)                                                  │
│    ├── 3x3 Grid Display (interactive cells)                                 │
│    ├── Guess Counter (e.g. "Guesses remaining: 7 / 9")                      │
│    ├── Comedian Autocomplete Search Modal                                   │
│    └── Game Over / Share Scorecard Modal                                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        CLIENT PERSISTENCE LAYER                             │
│                                                                             │
│  localStorage Key: "rbl_immaculate_grid_v1"                                 │
│    • Current Board State (selected cells, guesses remaining, completed)     │
│    • Historical Stats (games played, win %, current streak, max streak)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    VALIDATION ENGINE (Client or API)                        │
│                                                                             │
│  validateGridGuess(battlerId, rowCategory, colCategory):                     │
│    • Returns { valid: boolean, battler: BattlerSummary, reason?: string }   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Unauthenticated State Persistence (`localStorage`)

Players do not need to log in or create an account. All game state and career statistics are saved to the browser via `localStorage` under the key:
`rbl_immaculate_grid_v1`

#### Schema of Stored State:
```json
{
  "activeGridId": "2026-10-10",
  "guessesRemaining": 7,
  "isCompleted": false,
  "score": 2,
  "cells": {
    "0-0": {
      "battlerId": "battler-1",
      "battlerName": "Kyle Adams",
      "imageUrl": "https://...",
      "status": "correct"
    },
    "0-1": {
      "battlerId": "battler-2",
      "battlerName": "John Doe",
      "status": "incorrect"
    }
  },
  "stats": {
    "gamesPlayed": 12,
    "gamesCompleted": 10,
    "totalCorrectCells": 78,
    "currentStreak": 4,
    "maxStreak": 7,
    "lastPlayedDate": "2026-10-10"
  }
}
```

### 3.2 Comedian Autocomplete Picker
When a player clicks an empty cell:
1. An overlay modal opens displaying a search input: *"Search comedian by name..."*.
2. As the user types, it queries the local battlers list or API (`/api/public/battlers`) with debouncing.
3. Renders suggestions showing:
   * Comedian Stage Name
   * Headshot thumbnail
   * Career Record (`10W - 2L`)
4. Upon clicking a comedian:
   * Verifies the comedian hasn't already been used in this grid.
   * Evaluates validity against Row and Column criteria.
   * Updates cell state and decrements remaining guesses.

### 3.3 Post-Game Modal & Share Feature
When `guessesRemaining === 0` OR all 9 cells are filled:
* Displays congratulations / game over dialog.
* Shows final score: e.g. `8 / 9`.
* Displays a **"Copy Scorecard"** button that copies an emoji summary to the clipboard:
  ```text
  Roast Battle League Grid #42
  8/9 🎯
  🟩🟩🟩
  🟩🟥🟩
  🟩🟩🟩
  play: roastbattle.nyc/grid
  ```

---

## 4. Database Setup Instructions for Junior Developers

To build and test the game, developers should **NOT** connect to production. Instead, they can spin up a local database in under 2 minutes:

### Step 1: Install & Start Local Supabase
```bash
npx supabase start
```

### Step 2: Seed the Public Battle Data
A pre-sanitized seed dataset is available in [`supabase/seed-grid.sql`](file:///Users/danielwickes/rbl-website/supabase/seed-grid.sql). It contains 1,920 real battlers, 1,793 matches, 358 shows, and 40 cities with all private user data stripped.

Run the seed script:
```bash
npx supabase db reset --seed-path supabase/seed-grid.sql
```
*(Or paste `supabase/seed-grid.sql` into the Supabase Web Studio SQL Editor).*

---

## 5. Development Milestones & Task Breakdown

Developers should implement the project in four sequential milestones:

### Milestone 1: The Category & Validation Engine
* **Goal:** A standalone utility module `src/utils/gridValidation.ts` that checks if a battler meets category criteria.
* **Key Function:**
  ```typescript
  export function checkCategoryMatch(
    battler: Battler,
    category: GridCategory,
    context: { matches: Match[]; shows: Show[]; cities: City[]; points: RblPoint[] }
  ): boolean;
  ```
* **Deliverable:** Unit tests in `src/utils/gridValidation.test.ts` verifying each category type against mock match data.

### Milestone 2: Grid Board UI & Autocomplete Picker
* **Goal:** Interactive 3x3 layout with responsive mobile styling.
* **Components to build:**
  * `src/components/grid/ImmaculateGridPage.tsx`
  * `src/components/grid/GridCell.tsx`
  * `src/components/grid/BattlerSearchModal.tsx`
* **Deliverable:** Clicking a cell opens the search modal; selecting a comic evaluates the guess and renders a green/red result on the cell.

### Milestone 3: LocalStorage State Sync & Game Over Modal
* **Goal:** Persist state so refreshing or leaving the page preserves guesses and career streaks.
* **Hook to build:** `src/hooks/useGridGameState.ts`
  * Reads and writes `localStorage`.
  * Exposes `{ cells, guessesLeft, submitGuess, resetGame, stats }`.
* **Deliverable:** Finishing 9 guesses triggers `GameOverModal` with score summary and emoji clipboard share.

### Milestone 4: Daily Board Schedule & Optional Rarity Scoring
* **Goal:** Daily seed generation so all players get the same board on any given calendar day.
* **Helper:** `src/utils/dailyGridGenerator.ts` generates deterministic row and column categories based on the current date string (`YYYY-MM-DD`).

---

## 6. Definition of Done & Quality Gates

Before merging the feature branch into `main`:
1. All unit tests pass: `npm test`
2. TypeScript compiles with 0 errors: `npm run lint` (`tsc --noEmit`)
3. Production build succeeds: `npm run build`
4. Browser check: Game operates smoothly on both mobile (touch) and desktop.
