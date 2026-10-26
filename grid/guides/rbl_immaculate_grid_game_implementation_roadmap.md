# 🥊 Roast Battle League Grid Game — Implementation Roadmap

This guide outlines the complete end-to-end architecture, database schema design, grid generation logic, and API structure for building an Immaculate Grid-style game on top of your existing Roast Battle League (RBL) database.

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema & Category Table Design](#2-database-schema--category-table-design)
3. [Category System & SQL Template Engine](#3-category-system--sql-template-engine)
4. [Daily Grid Generation & Solvability Workflow](#4-daily-grid-generation--solvability-workflow)
5. [API Routes & Server Endpoints](#5-api-routes--server-endpoints)
6. [Frontend & User Experience Checklist](#6-frontend--user-experience-checklist)
7. [Step-by-Step Implementation Roadmap](#7-step-by-step-implementation-roadmap)

---

## 1. Architecture Overview

To keep performance fast and prevent unnecessary database load, the system operates on a **Pre-Calculated Daily Grid Model**:

```
 ┌──────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────────┐
 │  RBL Source Database │      │   Category Catalog      │      │   Daily Grid Cron Job    │
 │  (battlers, matches, │ ───► │   (Filtered Pool in     │ ───► │  (Solvability Check &    │
 │   shows, cities, etc)│      │    `categories` table)  │      │   Picks Daily 3x3 Grid)  │
 └──────────────────────┘      └─────────────────────────┘      └────────────┬─────────────┘
                                                                             │
 ┌──────────────────────┐      ┌─────────────────────────┐                   ▼
 │  User Browser App    │ ◄─── │  API Server             │ ◄──── ┌──────────────────────────┐
 │  (React/Next/Vue)    │      │  (Validate Guesses,     │       │   `daily_puzzles` Table  │
 │  (LocalStorage)      │      │   Autocomplete, Stats)  │       │   (Published Daily Grid) │
 └──────────────────────┘      └─────────────────────────┘       └──────────────────────────┘
```

* **Database:** PostgreSQL containing live RBL records.
* **Backend:** Node.js / Express / Next.js API route handlers.
* **Daily Scheduler:** A cron job running at midnight UTC to pick and validate the next day's puzzle.

---

## 2. Database Schema & Category Table Design

Add two dedicated administrative tables to support game state and category management.

### A. The `categories` Table
Stores candidate categories, their parameters, and preferred grid axes.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,              -- Display label (e.g. "Fought in New York")
  category_type VARCHAR(50) NOT NULL,      -- 'CITY', 'VENUE', 'OPPONENT', 'WINS', 'WIN_RATE', 'POINTS'
  target_id INT NULL,                      -- Ref ID (city_id, location_id, battler_id)
  threshold_value INT NULL,                -- Metric cutoff (e.g. 5 for wins, 70 for win rate)
  axis_preference VARCHAR(10) DEFAULT 'ANY',-- 'ROW', 'COLUMN', or 'ANY'
  is_active BOOLEAN DEFAULT TRUE,          -- Quick toggle for maintenance
  created_at TIMESTAMP DEFAULT NOW()
);
```

### B. The `daily_puzzles` Table
Stores pre-generated, validated 3x3 grids.

```sql
CREATE TABLE daily_puzzles (
  id SERIAL PRIMARY KEY,
  puzzle_date DATE UNIQUE NOT NULL,       -- e.g. 2026-10-25
  row_category_ids INT[] NOT NULL,        -- Array of 3 category IDs
  col_category_ids INT[] NOT NULL,        -- Array of 3 category IDs
  created_at TIMESTAMP DEFAULT NOW()
);
```

### C. The `user_cell_stats` Table (For Rarity Scores)
Tracks community answer distributions for calculating rarity metrics.

```sql
CREATE TABLE user_cell_stats (
  id SERIAL PRIMARY KEY,
  puzzle_date DATE NOT NULL,
  cell_index INT NOT NULL,                -- Cell 0 through 8
  battler_id INT NOT NULL,
  guess_count INT DEFAULT 1,
  UNIQUE(puzzle_date, cell_index, battler_id)
);
```

---

## 3. Category System & SQL Template Engine

In your server backend codebase, maintain a mapping dictionary that translates category parameters into executable PostgreSQL conditions.

```javascript
// Category SQL Generator Engine
const CATEGORY_SQL_GENERATORS = {
  CITY: (targetId) => `
    (EXISTS (
      SELECT 1 FROM matches m 
      JOIN shows s ON m.show_id = s.id 
      WHERE (m.battler_1_id = b.id OR m.battler_2_id = b.id) 
        AND s.city_id = ${targetId}
    ) OR b.city_id = ${targetId})`,

  VENUE: (targetId) => `
    EXISTS (
      SELECT 1 FROM matches m 
      JOIN shows s ON m.show_id = s.id 
      WHERE (m.battler_1_id = b.id OR m.battler_2_id = b.id) 
        AND s.location_id = ${targetId}
    )`,

  OPPONENT: (targetId) => `
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.battler_1_id = b.id AND m.battler_2_id = ${targetId}) 
         OR (m.battler_2_id = b.id AND m.battler_1_id = ${targetId})
    )`,

  CAREER_WINS: (threshold) => `
    (b.calculatedWins >= ${threshold} OR b.wins >= ${threshold})`,

  POINTS: (threshold) => `
    (b.calculatedPoints >= ${threshold} OR (
      SELECT COALESCE(SUM(points), 0) FROM rbl_points WHERE battler_id = b.id
    ) >= ${threshold})`,

  WIN_RATE: (threshold, minMatches = 3) => `
    (b.totalMatches >= ${minMatches} AND (CAST(b.wins AS FLOAT) / b.totalMatches) >= ${threshold / 100})`
};
```

---

## 4. Daily Grid Generation & Solvability Workflow

A background job must pick and verify grid configurations using this step-by-step logic:

1. **Fetch Candidates:**
   * Select 3 distinct categories with `axis_preference IN ('ROW', 'ANY')`.
   * Select 3 distinct categories with `axis_preference IN ('COLUMN', 'ANY')`.

2. **Verify Cell Intersections (Solvability Checker):**
   * Loop through all 9 cells ($Cell_{r,c} = Row_r \cap Column_c$).
   * Run the intersection query:
     ```sql
     SELECT COUNT(DISTINCT b.id) AS match_count
     FROM battlers b
     WHERE [Row_r Condition] AND [Col_c Condition];
     ```

3. **Check Threshold Minimums:**
   * **Rule:** Every individual cell must have **at least 2 valid battlers**.
   * If any cell returns `< 2`, discard the grid candidate and re-roll.

4. **Persist Puzzle:**
   * Write the verified combination to `daily_puzzles`.

---

## 5. API Routes & Server Endpoints

| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/grid/today` | Returns today's row and column categories (metadata only, no answer key). | `?date=YYYY-MM-DD` |
| **GET** | `/api/battlers/search` | Autocomplete search for the player selection modal. | `?q=dan` |
| **POST** | `/api/grid/validate` | Validates a user's guess for a specific cell and updates cell stats. | `{ cell_index: 0, battler_id: 14 }` |
| **GET** | `/api/grid/summary` | Returns post-game solution details and rarity percentages. | `?date=YYYY-MM-DD` |

---

## 6. Frontend & User Experience Checklist

- [ ] **Mobile-Responsive 4x4 CSS Grid:** Header row on top, header column on left, 3x3 play area.
- [ ] **Local State Persistence:** Save guesses, score, and remaining guess count in `localStorage`.
- [ ] **Search Autocomplete Modal:** Debounced text field to quickly find comedians without typing full names.
- [ ] **Guess Limit Enforcement:** Strict limit of **9 total guesses** (correct or incorrect).
- [ ] **Shareable Emoji Output:** Copy-to-clipboard functionality emitting standard grid blocks:
  ```text
  Roast Battle Grid #12
  🟩 🟥 🟩
  🟩 🟩 🟩
  ⬜ 🟩 🟥
  Rarity Score: 42.1
  ```

---

## 7. Step-by-Step Implementation Roadmap

- [ ] **Phase 1: Seed Category Catalog**
  - Populate the `categories` table with initial cities, venues, prominent battlers, and stat milestones.
- [ ] **Phase 2: Build the SQL Validator Engine**
  - Implement and unit-test the category condition generator in your server code.
- [ ] **Phase 3: Write Grid Generator & Solvability Checker**
  - Build the automated script that evaluates 3x3 grid combinations and saves them to `daily_puzzles`.
- [ ] **Phase 4: Construct API Endpoints**
  - Expose `/api/grid/today`, `/api/battlers/search`, and `/api/grid/validate`.
- [ ] **Phase 5: Build Frontend UI & Game Loop**
  - Implement grid rendering, modal lookup, guess tracking, and completion modal.
- [ ] **Phase 6: Deploy & Automate**
  - Set up a daily cron job to run grid generation automatically every night.