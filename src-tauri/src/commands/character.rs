use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct Character {
    pub id: i64,
    pub name: String,
    pub level: i32,
    pub xp: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Stats {
    pub character_id: i64,
    pub intelligence: i32,
    pub focus: i32,
    pub discipline: i32,
    pub knowledge: i32,
    pub health: i32,
}

fn xp_to_level(xp: i32) -> i32 {
    (1 + xp / 100).max(1)
}

#[tauri::command]
pub fn create_character(name: String, state: State<Database>) -> Result<Character, String> {
    log::info!("create_character: name={}", name);
    let created_at = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO characters (name, level, xp, created_at) VALUES (?1, 1, 0, ?2)",
        rusqlite::params![name, created_at],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    conn.execute(
        "INSERT INTO stats (character_id, intelligence, focus, discipline, knowledge, health) VALUES (?1, 0, 0, 0, 0, 0)",
        rusqlite::params![id],
    )
    .map_err(|e| e.to_string())?;
    log::info!("create_character: id={} created", id);
    Ok(Character {
        id,
        name,
        level: 1,
        xp: 0,
        created_at,
    })
}

#[tauri::command]
pub fn get_character(state: State<Database>) -> Result<Option<Character>, String> {
    log::debug!("get_character called");
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, level, xp, created_at FROM characters ORDER BY id DESC LIMIT 1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        Ok(Some(Character {
            id: row.get(0).map_err(|e| e.to_string())?,
            name: row.get(1).map_err(|e| e.to_string())?,
            level: row.get(2).map_err(|e| e.to_string())?,
            xp: row.get(3).map_err(|e| e.to_string())?,
            created_at: row.get(4).map_err(|e| e.to_string())?,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn get_stats(character_id: i64, state: State<Database>) -> Result<Stats, String> {
    log::debug!("get_stats: character_id={}", character_id);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT character_id, intelligence, focus, discipline, knowledge, health FROM stats WHERE character_id = ?1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query(rusqlite::params![character_id]).map_err(|e| e.to_string())?;
    let row = rows.next().map_err(|e| e.to_string())?.ok_or("Stats not found")?;
    Ok(Stats {
        character_id: row.get(0).map_err(|e| e.to_string())?,
        intelligence: row.get(1).map_err(|e| e.to_string())?,
        focus: row.get(2).map_err(|e| e.to_string())?,
        discipline: row.get(3).map_err(|e| e.to_string())?,
        knowledge: row.get(4).map_err(|e| e.to_string())?,
        health: row.get(5).map_err(|e| e.to_string())?,
    })
}

#[tauri::command]
pub fn update_character_xp(
    character_id: i64,
    xp_delta: i32,
    state: State<Database>,
) -> Result<(i32, i32), String> {
    log::info!("update_character_xp: character_id={} delta={}", character_id, xp_delta);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let current_xp: i32 = conn
        .query_row("SELECT xp FROM characters WHERE id = ?1", rusqlite::params![character_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    let new_xp = (current_xp + xp_delta).max(0);
    let new_level = xp_to_level(new_xp);
    conn.execute(
        "UPDATE characters SET xp = ?1, level = ?2 WHERE id = ?3",
        rusqlite::params![new_xp, new_level, character_id],
    )
    .map_err(|e| e.to_string())?;
    log::info!("update_character_xp: new_level={} new_xp={}", new_level, new_xp);
    Ok((new_level, new_xp))
}

#[tauri::command]
pub fn reset_app(state: State<Database>) -> Result<(), String> {
    log::warn!("reset_app: clearing all character data");
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM characters", [])
        .map_err(|e| e.to_string())?;
    log::info!("reset_app: completed");
    Ok(())
}
