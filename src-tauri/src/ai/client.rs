use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::prompt;
use super::rules;

#[derive(Debug, Serialize, Deserialize)]
pub struct XpResult {
    pub intelligence: i32,
    pub discipline: i32,
    pub focus: i32,
    pub knowledge: i32,
    pub health: i32,
}

impl XpResult {
    pub fn total(&self) -> i32 {
        self.intelligence + self.discipline + self.focus + self.knowledge + self.health
    }

    fn from_map(m: HashMap<String, i32>) -> Self {
        Self {
            intelligence: m.get("intelligence").copied().unwrap_or(0),
            discipline: m.get("discipline").copied().unwrap_or(0),
            focus: m.get("focus").copied().unwrap_or(0),
            knowledge: m.get("knowledge").copied().unwrap_or(0),
            health: m.get("health").copied().unwrap_or(0),
        }
    }
}

#[tauri::command]
pub async fn analyze_activity(content: String) -> Result<XpResult, String> {
    // Try rule-based first
    if let Some(m) = rules::try_rule_based(&content) {
        return Ok(XpResult::from_map(m));
    }

    // Fall back to LLM
    let host = std::env::var("OLLAMA_HOST").unwrap_or_else(|_| "http://localhost:11434".into());
    let url = format!("{}/api/generate", host.trim_end_matches('/'));

    let prompt = prompt::build_prompt(&content);

    let body = serde_json::json!({
        "model": "qwen2.5:7b",
        "prompt": prompt,
        "stream": false
    });

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Ollama request failed: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Ollama returned status: {}", res.status()));
    }

    let json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    let response_text = json
        .get("response")
        .and_then(|v| v.as_str())
        .ok_or("No 'response' in Ollama response")?;

    // Extract JSON from response (may have markdown code blocks)
    let json_str = response_text
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    let parsed: serde_json::Value = serde_json::from_str(json_str)
        .map_err(|e| format!("Failed to parse LLM JSON: {}", e))?;

    let obj = parsed.as_object().ok_or("Expected JSON object")?;

    Ok(XpResult {
        intelligence: obj
            .get("intelligence")
            .and_then(|v| v.as_i64())
            .unwrap_or(0) as i32,
        discipline: obj
            .get("discipline")
            .and_then(|v| v.as_i64())
            .unwrap_or(0) as i32,
        focus: obj.get("focus").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
        knowledge: obj
            .get("knowledge")
            .and_then(|v| v.as_i64())
            .unwrap_or(0) as i32,
        health: obj.get("health").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
    })
}
