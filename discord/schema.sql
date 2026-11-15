-- One row per player, per Discord server (or DM channel), per day. The first result of the day wins.
CREATE TABLE IF NOT EXISTS results (
  scope TEXT NOT NULL,        -- guild id, or channel id outside a server
  day TEXT NOT NULL,          -- YYYY-MM-DD in Europe/Paris, the game's day
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  attempts INTEGER NOT NULL,  -- 1 to 6, or 7 for a lost game
  grid TEXT NOT NULL,         -- one line per attempt: c = correct, p = partial, i = incorrect
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (scope, day, user_id)
);
