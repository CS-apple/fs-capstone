DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

-- user_one 
--password 
-- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzkyNDU5MTY5LCJleHAiOjE3OTMwNjM5Njl9.ht3khp8W42l-YOW64K5aV3Tq5qkXEo2adqSpMUhoBmc