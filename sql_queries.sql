CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rolle TEXT NOT NULL,
  forelder1 TEXT,
  forelder2 TEXT,
  password TEXT NOT NULL,
  kompani TEXT,
  bataljon NUMBER
)

CREATE TABLE IF NOT EXISTS bataljon (
  bataljon_id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  medlemmer NUMBER NOT NULL
)

CREATE TABLE IF NOT EXISTS kompani (
  kompani_id INTEGER PRIMARY KEY NOT NULL,
  bataljon_id NUMBER NOT NULL,
  name TEXT NOT NULL,
  leder TEXT NOT NULL,
  medlemmer NUMBER NOT NULL
)