-- ==========================================
-- 1. DROP EXISTING TABLES (Clean Reset)
-- ==========================================
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS battlers CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Cities Table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Battlers (Comedians) Table
CREATE TABLE battlers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    city_id INTEGER REFERENCES cities(id),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    calculated_wins INTEGER DEFAULT 0,
    calculated_points INTEGER DEFAULT 0
);

-- Locations (Venues) Table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES cities(id)
);

-- Shows Table
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    city_id INTEGER REFERENCES cities(id),
    date DATE NOT NULL
);

-- Matches Table (Head-to-head battles)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    battler_1_id INTEGER REFERENCES battlers(id),
    battler_2_id INTEGER REFERENCES battlers(id),
    show_id INTEGER REFERENCES shows(id)
);

-- ==========================================
-- 3. INSERT EXPANDED DUMMY DATA SEED
-- ==========================================

-- Insert Cities
INSERT INTO cities (id, name) VALUES
(1, 'New York'),
(2, 'Los Angeles'),
(3, 'Austin'),
(4, 'Chicago'),
(5, 'Nashville');

-- Insert Venues (Locations)
INSERT INTO locations (id, name, city_id) VALUES
(1, 'New York Comedy Club', 1),
(2, 'The Comedy Store', 2),
(3, 'The Grove', 3),
(4, 'Zanies Comedy Club', 4),
(5, 'The Comedy Catch', 5);

-- Insert Battlers (Comedians)
INSERT INTO battlers (id, name, image_url, city_id, wins, losses, calculated_wins, calculated_points) VALUES
(1, 'Kyle Adams', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1, 10, 2, 10, 120),
(2, 'John Doe', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 2, 8, 4, 8, 95),
(3, 'Sarah Jenkins', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 1, 12, 1, 12, 150),
(4, 'Marcus Vance', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 3, 5, 5, 5, 60),
(5, 'Elena Rostova', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 2, 15, 2, 15, 180),
(6, 'Tommy Green', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 3, 3, 6, 3, 40),
(7, 'Chloe Bennett', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 4, 9, 3, 9, 110),
(8, 'Damon Brooks', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 5, 7, 7, 7, 85),
(9, 'Maya Lin', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 1, 11, 4, 11, 135),
(10, 'Zack Taylor', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 2, 4, 8, 4, 50);

-- Insert Shows
INSERT INTO shows (id, location_id, city_id, date) VALUES
(1, 1, 1, '2026-01-15'), 
(2, 2, 2, '2026-02-10'), 
(3, 3, 3, '2026-03-05'),
(4, 4, 4, '2026-04-12'),
(5, 5, 5, '2026-05-20'),
(6, 1, 1, '2026-06-01');

-- Insert Matches (Head-to-head battles)
INSERT INTO matches (id, battler_1_id, battler_2_id, show_id) VALUES
(1, 1, 2, 1), 
(2, 1, 3, 2), 
(3, 2, 4, 2), 
(4, 3, 5, 3), 
(5, 4, 6, 3),
(6, 7, 8, 4),
(7, 9, 10, 5),
(8, 1, 9, 6),
(9, 3, 7, 6),
(10, 2, 10, 5);