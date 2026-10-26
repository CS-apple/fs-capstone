DROP TABLE IF EXISTS categories; 

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,              
  category_type VARCHAR(50) NOT NULL,      
  target_id VARCHAR(255) NULL,                 
  parameter INT NULL,
  is_active BOOLEAN DEFAULT TRUE          
);