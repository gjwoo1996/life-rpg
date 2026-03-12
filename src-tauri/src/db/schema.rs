use rusqlite::Connection;

pub fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS goals (
            goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            target_skill TEXT NOT NULL,
            calendar_color TEXT DEFAULT '#6366f1'
        );
        ",
    )?;
    // Migration: add calendar_color to existing goals table if missing
    let _ = conn.execute("ALTER TABLE goals ADD COLUMN calendar_color TEXT DEFAULT '#6366f1'", []);
    // Migration: add summary to existing activity_logs if missing
    let _ = conn.execute("ALTER TABLE activity_logs ADD COLUMN summary TEXT", []);
    // Migration: remove legacy stats table (replaced by abilities/ability_stats)
    let _ = conn.execute("DROP TABLE IF EXISTS stats", []);
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS activity_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            ai_result TEXT,
            xp_gained INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS abilities (
            ability_id INTEGER PRIMARY KEY AUTOINCREMENT,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            UNIQUE(character_id, name)
        );

        CREATE TABLE IF NOT EXISTS ability_stats (
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            ability_id INTEGER NOT NULL REFERENCES abilities(ability_id) ON DELETE CASCADE,
            xp INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (character_id, ability_id)
        );

        CREATE TABLE IF NOT EXISTS daily_analyses (
            date TEXT NOT NULL,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            analysis_text TEXT NOT NULL,
            PRIMARY KEY (date, character_id)
        );

        CREATE TABLE IF NOT EXISTS goal_analyses (
            goal_id INTEGER PRIMARY KEY REFERENCES goals(goal_id) ON DELETE CASCADE,
            character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
            summarized_context TEXT,
            last_analyzed_at TEXT,
            analysis_text TEXT
        );
        ",
    )
}
