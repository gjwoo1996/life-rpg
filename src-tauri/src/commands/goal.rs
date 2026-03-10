use crate::db::Database;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct Goal {
    pub goal_id: i64,
    pub character_id: i64,
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub target_skill: String,
}

#[tauri::command]
pub fn create_goal(
    character_id: i64,
    name: String,
    start_date: String,
    end_date: String,
    target_skill: String,
    state: State<Database>,
) -> Result<Goal, String> {
    log::info!("create_goal: character_id={} name={}", character_id, name);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO goals (character_id, name, start_date, end_date, target_skill) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![character_id, name, start_date, end_date, target_skill],
    )
    .map_err(|e| e.to_string())?;
    let goal_id = conn.last_insert_rowid();
    Ok(Goal {
        goal_id,
        character_id,
        name,
        start_date,
        end_date,
        target_skill,
    })
}

#[tauri::command]
pub fn list_goals(character_id: i64, state: State<Database>) -> Result<Vec<Goal>, String> {
    log::debug!("list_goals: character_id={}", character_id);
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT goal_id, character_id, name, start_date, end_date, target_skill FROM goals WHERE character_id = ?1 ORDER BY goal_id DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![character_id], |row| {
            Ok(Goal {
                goal_id: row.get(0)?,
                character_id: row.get(1)?,
                name: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                target_skill: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}
