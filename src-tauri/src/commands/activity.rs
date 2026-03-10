use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityLog {
    pub log_id: i64,
    pub character_id: i64,
    pub date: String,
    pub content: String,
    pub ai_result: Option<String>,
    pub xp_gained: i32,
}

#[tauri::command]
pub fn create_activity_log(
    character_id: i64,
    date: String,
    content: String,
    xp_gained: i32,
    state: State<Database>,
) -> Result<ActivityLog, String> {
    log::info!("create_activity_log: character_id={} date={} xp_gained={}", character_id, date, xp_gained);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO activity_logs (character_id, date, content, xp_gained) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![character_id, date, content, xp_gained],
    )
    .map_err(|e| e.to_string())?;
    let log_id = conn.last_insert_rowid();

    // Update character XP
    let current_xp: i32 = conn
        .query_row("SELECT xp FROM characters WHERE id = ?1", rusqlite::params![character_id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    let new_xp = (current_xp + xp_gained).max(0);
    let new_level = (1 + new_xp / 100).max(1);
    conn.execute(
        "UPDATE characters SET xp = ?1, level = ?2 WHERE id = ?3",
        rusqlite::params![new_xp, new_level, character_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(ActivityLog {
        log_id,
        character_id,
        date,
        content,
        ai_result: None,
        xp_gained,
    })
}

fn row_to_log(row: &rusqlite::Row<'_>) -> rusqlite::Result<ActivityLog> {
    Ok(ActivityLog {
        log_id: row.get(0)?,
        character_id: row.get(1)?,
        date: row.get(2)?,
        content: row.get(3)?,
        ai_result: row.get(4)?,
        xp_gained: row.get(5)?,
    })
}

#[tauri::command]
pub fn list_activity_logs(
    character_id: i64,
    from_date: Option<String>,
    to_date: Option<String>,
    state: State<Database>,
) -> Result<Vec<ActivityLog>, String> {
    log::debug!("list_activity_logs: character_id={}", character_id);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let from = from_date.as_deref().unwrap_or("0000-00-00");
    let to = to_date.as_deref().unwrap_or("9999-99-99");

    let mut stmt = conn
        .prepare(
            "SELECT log_id, character_id, date, content, ai_result, xp_gained FROM activity_logs \
             WHERE character_id = ?1 AND date >= ?2 AND date <= ?3 ORDER BY date DESC, log_id DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![character_id, from, to], row_to_log)
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, rusqlite::Error>>()
        .map_err(|e| e.to_string())
}
