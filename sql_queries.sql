CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rolle TEXT NOT NULL,
  forelder1 TEXT,
  forelder2 TEXT,
  password TEXT NOT NULL,
  kompani TEXT,
  bataljon TEXT
)