DROP TABLE IF EXISTS categories; 
DROP TABLE IF EXISTS grids

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,              
  category_type VARCHAR(50) NOT NULL,      
  target_id VARCHAR(255) NULL,                 
  parameter INT NULL,
  is_active BOOLEAN DEFAULT TRUE          
);

CREATE TABLE  grids(
  id SERIAL PRIMARY KEY,
  rows INTEGER[]NOT NULL,
  cols INTEGER[] NOT NULL,
  created_at Timestamp WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);