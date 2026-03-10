use crate::commands::ability::{add_ability_xp_inner, get_ability_names_inner};
use crate::db::Database;
use crate::ai::client::{analyze_activity, get_daily_analysis_text, summarize_content};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityLog {
    pub log_id: i64,
    pub character_id: i64,
    pub date: String,
    pub content: String,
    pub summary: Option<String>,
    pub ai_result: Option<String>,
    pub xp_gained: i32,
}

fn today_ymd() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

#[tauri::command]
pub async fn create_activity_log(
    character_id: i64,
    date: String,
    content: String,
    state: State<'_, Database>,
) -> Result<ActivityLog, String> {
    let content = content.trim().to_string();
    if content.is_empty() {
        return Err("Content cannot be empty".to_string());
    }
    let today = today_ymd();
    if date != today {
        return Err(format!("Only today's date ({}) is allowed for activity logs", today));
    }

    let ability_names = {
        let conn = state.0.lock().expect("db lock");
        get_ability_names_inner(&conn, character_id)?
    };
    if ability_names.is_empty() {
        return Err("Add at least one goal with an ability before logging activities".to_string());
    }

    let summary = summarize_content(content.clone())
        .await
        .unwrap_or_else(|_| String::new());

    let xp_map = analyze_activity(content.clone(), ability_names.clone())
        .await
        .map_err(|e| e.to_string())?;
    let xp_gained: i32 = xp_map.values().sum();

    {
        let conn = state.0.lock().expect("db lock");
        for (name, xp) in &xp_map {
            if *xp > 0 {
                add_ability_xp_inner(&conn, character_id, name, *xp).ok();
            }
        }
    }

    let summary_opt = if summary.is_empty() { None } else { Some(summary.clone()) };
    let (log_id, day_logs): (i64, Vec<(String, String)>) = {
        let conn = state.0.lock().expect("db lock");
        conn.execute(
            "INSERT INTO activity_logs (character_id, date, content, summary, xp_gained) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![character_id, date, content, summary_opt, xp_gained],
        )
        .map_err(|e| e.to_string())?;
        let log_id = conn.last_insert_rowid();
        let day_logs: Vec<(String, String)> = match conn.prepare("SELECT content, COALESCE(summary, '') FROM activity_logs WHERE character_id = ?1 AND date = ?2 ORDER BY log_id") {
            Ok(mut stmt) => {
                let rows = stmt.query_map(rusqlite::params![character_id, date], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)));
                match rows {
                    Ok(iter) => iter.filter_map(Result::ok).collect(),
                    Err(_) => Vec::new(),
                }
            }
            Err(_) => Vec::new(),
        };
        (log_id, day_logs)
    };

    if !day_logs.is_empty() {
        let activities_text: String = day_logs
            .into_iter()
            .map(|(c, s)| if s.is_empty() { c } else { format!("[{}] {}", s, c) })
            .collect::<Vec<_>>()
            .join("\n");
        if let Ok(analysis_text) = get_daily_analysis_text(activities_text).await {
            let conn2 = state.0.lock().expect("db lock");
            let _ = conn2.execute(
                "REPLACE INTO daily_analyses (date, character_id, analysis_text) VALUES (?1, ?2, ?3)",
                rusqlite::params![date, character_id, analysis_text],
            );
        }
    }

    Ok(ActivityLog {
        log_id,
        character_id,
        date,
        content,
        summary: summary_opt,
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
        summary: row.get(4)?,
        ai_result: row.get(5)?,
        xp_gained: row.get(6)?,
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
            "SELECT log_id, character_id, date, content, summary, ai_result, xp_gained FROM activity_logs \
             WHERE character_id = ?1 AND date >= ?2 AND date <= ?3 ORDER BY date DESC, log_id DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![character_id, from, to], row_to_log)
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, rusqlite::Error>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_daily_analysis(
    character_id: i64,
    date: String,
    state: State<Database>,
) -> Result<Option<String>, String> {
    let conn = state.0.lock().expect("db lock");
    let mut stmt = conn
        .prepare("SELECT analysis_text FROM daily_analyses WHERE character_id = ?1 AND date = ?2")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt
        .query_map(rusqlite::params![character_id, date], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    if let Some(row) = rows.next() {
        return row.map(Some).map_err(|e| e.to_string());
    }
    Ok(None)
}
