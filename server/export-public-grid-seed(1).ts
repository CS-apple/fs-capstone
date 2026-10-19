import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeSql(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function fetchAll(table: string, columns: string, orderBy = "created_at"): Promise<any[]> {
  const pageSize = 1000;
  let allRecords: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      break;
    }

    if (data && data.length > 0) {
      allRecords = allRecords.concat(data);
      from += pageSize;
      if (data.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${allRecords.length} records from ${table}`);
  return allRecords;
}

export async function generatePublicGridSeed(): Promise<string> {
  console.log("Generating sanitized public seed dataset for Immaculate Grid...");

  const [divisions, cities, locations, battlers, lineups, shows, matches, rblPoints] = await Promise.all([
    fetchAll("divisions", "id, name"),
    fetchAll("cities", "id, numeric_id, name, wrbl, division_id, logo_url"),
    fetchAll("locations", "id, name, image, description, address, google_maps_link, city_id"),
    fetchAll(
      "battlers",
      "id, name, gender, race, rating, instagram, bio, show_on_homepage, show_on_city_page, wins, losses, draws, image_url, city_id"
    ),
    fetchAll("lineups", "id, name, host_id"),
    fetchAll(
      "shows",
      "id, datetime, location_id, lineup_id, venue, ticket_url, link, city_id, prize"
    ),
    fetchAll("matches", "id, lineup_id, battler_1_id, battler_2_id, winner_id, battle_no"),
    fetchAll("rbl_points", "id, season, week, battler_id1, battler_id2, ranking, city, points")
  ]);

  let sql = `-- ==============================================================================
-- Roast Battle League: Sanitized Public Data Seed for Immaculate Grid Game
-- ==============================================================================
-- Notice: This file contains ONLY public comedy statistics, contender profiles,
-- and head-to-head match records. All PII, customer subscriber lists, user auth
-- hashes, payment tokens, and internal operational logs are completely excluded.
-- ==============================================================================

BEGIN;

`;

  // 1. Divisions
  sql += `-- 1. Divisions\n`;
  for (const d of divisions) {
    sql += `INSERT INTO public.divisions (id, name) VALUES (${escapeSql(d.id)}, ${escapeSql(d.name)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  // 2. Cities
  sql += `-- 2. Cities\n`;
  for (const c of cities) {
    sql += `INSERT INTO public.cities (id, numeric_id, name, wrbl, division_id, logo_url) VALUES (${escapeSql(c.id)}, ${escapeSql(c.numeric_id)}, ${escapeSql(c.name)}, ${escapeSql(c.wrbl)}, ${escapeSql(c.division_id)}, ${escapeSql(c.logo_url)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  // 3. Locations
  sql += `-- 3. Locations (Venues)\n`;
  for (const loc of locations) {
    sql += `INSERT INTO public.locations (id, name, image, description, address, google_maps_link, city_id) VALUES (${escapeSql(loc.id)}, ${escapeSql(loc.name)}, ${escapeSql(loc.image)}, ${escapeSql(loc.description)}, ${escapeSql(loc.address)}, ${escapeSql(loc.google_maps_link)}, ${escapeSql(loc.city_id)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  // 4. Battlers
  sql += `-- 4. Battlers (Comedians - Public Stats Only)\n`;
  for (const b of battlers) {
    sql += `INSERT INTO public.battlers (id, name, gender, race, rating, instagram, bio, show_on_homepage, show_on_city_page, wins, losses, draws, image_url, city_id) VALUES (${escapeSql(b.id)}, ${escapeSql(b.name)}, ${escapeSql(b.gender)}, ${escapeSql(b.race)}, ${escapeSql(b.rating)}, ${escapeSql(b.instagram)}, ${escapeSql(b.bio)}, ${escapeSql(b.show_on_homepage)}, ${escapeSql(b.show_on_city_page)}, ${escapeSql(b.wins)}, ${escapeSql(b.losses)}, ${escapeSql(b.draws)}, ${escapeSql(b.image_url)}, ${escapeSql(b.city_id)}) ON CONFLICT (id) DO UPDATE SET wins = EXCLUDED.wins, losses = EXCLUDED.losses, draws = EXCLUDED.draws, rating = EXCLUDED.rating;\n`;
  }
  sql += `\n`;

  // 5. Lineups
  sql += `-- 5. Lineups\n`;
  for (const l of lineups) {
    sql += `INSERT INTO public.lineups (id, name, host_id) VALUES (${escapeSql(l.id)}, ${escapeSql(l.name)}, ${escapeSql(l.host_id)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  // 6. Shows
  sql += `-- 6. Shows\n`;
  for (const s of shows) {
    sql += `INSERT INTO public.shows (id, datetime, location_id, lineup_id, venue, ticket_url, link, city_id, prize) VALUES (${escapeSql(s.id)}, ${escapeSql(s.datetime)}, ${escapeSql(s.location_id)}, ${escapeSql(s.lineup_id)}, ${escapeSql(s.venue)}, ${escapeSql(s.ticket_url)}, ${escapeSql(s.link)}, ${escapeSql(s.city_id)}, ${escapeSql(s.prize)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  // 7. Matches
  sql += `-- 7. Matches (Battle Outcomes)\n`;
  for (const m of matches) {
    sql += `INSERT INTO public.matches (id, lineup_id, battler_1_id, battler_2_id, winner_id, battle_no) VALUES (${escapeSql(m.id)}, ${escapeSql(m.lineup_id)}, ${escapeSql(m.battler_1_id)}, ${escapeSql(m.battler_2_id)}, ${escapeSql(m.winner_id)}, ${escapeSql(m.battle_no)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  // 8. RBL Points
  sql += `-- 8. RBL Points\n`;
  for (const p of rblPoints) {
    sql += `INSERT INTO public.rbl_points (id, season, week, battler_id1, battler_id2, ranking, city, points) VALUES (${escapeSql(p.id)}, ${escapeSql(p.season)}, ${escapeSql(p.week)}, ${escapeSql(p.battler_id1)}, ${escapeSql(p.battler_id2)}, ${escapeSql(p.ranking)}, ${escapeSql(p.city)}, ${escapeSql(p.points)}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += `\n`;

  sql += `COMMIT;\n`;

  const outputPath = path.join(process.cwd(), "supabase", "seed-grid.sql");
  fs.writeFileSync(outputPath, sql, "utf8");
  console.log(`Successfully generated sanitized seed file: ${outputPath} (${(Buffer.byteLength(sql) / 1024 / 1024).toFixed(2)} MB)`);
  return outputPath;
}

// Allow CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("export-public-grid-seed")) {
  generatePublicGridSeed()
    .then((out) => console.log("Done! File ready at:", out))
    .catch((err) => {
      console.error("Export failed:", err);
      process.exit(1);
    });
}
