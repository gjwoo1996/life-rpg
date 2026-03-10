use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ability {
    pub ability_id: i64,
    pub character_id: i64,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbilityStat {
    pub ability_id: i64,
    pub name: String,
    pub xp: i32,
}

const MAX_ABILITY_XP: i32 = 100;

/// Get list of ability names for a character (for AI analysis).
pub fn get_ability_names_inner(conn: &rusqlite::Connection, character_id: i64) -> Result<Vec<String>, String> {
    let mut stmt = conn
        .prepare("SELECT name FROM abilities WHERE character_id = ?1 ORDER BY name")
        .map_err(|e| e.to_string())?;
    let names: Vec<String> = stmt
        .query_map(rusqlite::params![character_id], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(names)
}

/// Ensure an ability exists for the character (create if not). Returns ability_id.
pub fn ensure_ability_inner(
    conn: &rusqlite::Connection,
    character_id: i64,
    name: &str,
) -> Result<i64, String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("Ability name cannot be empty".to_string());
    }
    // Try insert; ignore if unique constraint (character_id, name) fails
    conn.execute(
        "INSERT OR IGNORE INTO abilities (character_id, name) VALUES (?1, ?2)",
        rusqlite::params![character_id, name],
    )
    .map_err(|e| e.to_string())?;
    let id: i64 = conn
        .query_row(
            "SELECT ability_id FROM abilities WHERE character_id = ?1 AND name = ?2",
            rusqlite::params![character_id, name],
            |r| r.get(0),
        )
        .map_err(|e| e.to_string())?;
    // Ensure ability_stats row exists
    conn.execute(
        "INSERT OR IGNORE INTO ability_stats (character_id, ability_id, xp) VALUES (?1, ?2, 0)",
        rusqlite::params![character_id, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn list_abilities(character_id: i64, state: State<Database>) -> Result<Vec<Ability>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT ability_id, character_id, name FROM abilities WHERE character_id = ?1 ORDER BY name")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![character_id], |row| {
            Ok(Ability {
                ability_id: row.get(0)?,
                character_id: row.get(1)?,
                name: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ensure_ability(
    character_id: i64,
    name: String,
    state: State<Database>,
) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    ensure_ability_inner(&conn, character_id, &name)
}

#[tauri::command]
pub fn get_ability_stats(
    character_id: i64,
    state: State<Database>,
) -> Result<Vec<AbilityStat>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT a.ability_id, a.name, COALESCE(s.xp, 0) FROM abilities a \
             LEFT JOIN ability_stats s ON a.character_id = s.character_id AND a.ability_id = s.ability_id \
             WHERE a.character_id = ?1 ORDER BY a.name",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![character_id], |row| {
            Ok(AbilityStat {
                ability_id: row.get(0)?,
                name: row.get(1)?,
                xp: row.get::<_, Option<i32>>(2)?.unwrap_or(0),
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

/// Add XP to an ability (by name). Caps at MAX_ABILITY_XP. Returns new xp.
pub fn add_ability_xp_inner(
    conn: &rusqlite::Connection,
    character_id: i64,
    ability_name: &str,
    xp_delta: i32,
) -> Result<i32, String> {
    let ability_id: i64 = conn
        .query_row(
            "SELECT ability_id FROM abilities WHERE character_id = ?1 AND name = ?2",
            rusqlite::params![character_id, ability_name],
            |r| r.get(0),
        )
        .map_err(|_| format!("Ability not found: {}", ability_name))?;
    let current: i32 = conn
        .query_row(
            "SELECT xp FROM ability_stats WHERE character_id = ?1 AND ability_id = ?2",
            rusqlite::params![character_id, ability_id],
            |r| r.get(0),
        )
        .unwrap_or(0);
    let new_xp = (current + xp_delta).max(0).min(MAX_ABILITY_XP);
    conn.execute(
        "UPDATE ability_stats SET xp = ?1 WHERE character_id = ?2 AND ability_id = ?3",
        rusqlite::params![new_xp, character_id, ability_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(new_xp)
}
