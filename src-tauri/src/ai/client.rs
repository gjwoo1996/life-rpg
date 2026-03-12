use std::collections::HashMap;

use super::prompt;
use super::rules;

fn default_model() -> String {
    std::env::var("LIFERPG_LLM_MODEL_DEFAULT").unwrap_or_else(|_| "qwen2.5:7b".to_string())
}

async fn call_llm(prompt: &str, model: Option<&str>) -> Result<String, String> {
    let host = std::env::var("OLLAMA_HOST").unwrap_or_else(|_| "http://localhost:11434".into());
    let url = format!("{}/api/generate", host.trim_end_matches('/'));
    let model = model.unwrap_or(&default_model()).to_string();
    log::info!("[Ollama] request model={} url={}", model, url);
    let body = serde_json::json!({
        "model": model,
        "prompt": prompt,
        "stream": false
    });
    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            log::warn!("[Ollama] request failed: {}", e);
            format!("Ollama request failed: {}", e)
        })?;
    if !res.status().is_success() {
        let status = res.status();
        log::warn!("[Ollama] response status={}", status);
        return Err(format!("Ollama returned status: {}", status));
    }
    let json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| {
            log::warn!("[Ollama] parse error: {}", e);
            format!("Failed to parse response: {}", e)
        })?;
    let text = json
        .get("response")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .trim()
        .to_string();
    log::info!("[Ollama] response ok len={}", text.len());
    Ok(text)
}

#[tauri::command]
pub async fn summarize_content(content: String) -> Result<String, String> {
    if content.trim().is_empty() {
        return Ok(String::new());
    }
    log::info!("[LLM] summarize_content start len={}", content.len());
    let prompt = prompt::build_summary_prompt(&content);
    let out = call_llm(&prompt, None).await;
    log::info!("[LLM] summarize_content done success={}", out.is_ok());
    out
}

/// Internal: get goal-level cumulative analysis from LLM.
pub async fn get_goal_analysis_text(
    goal_name: &str,
    target_ability: &str,
    previous_context: &str,
    activities_text: &str,
) -> Result<String, String> {
    log::info!("[LLM] get_goal_analysis_text goal={}", goal_name);
    let prompt = prompt::build_goal_analysis_prompt(
        goal_name,
        target_ability,
        previous_context,
        activities_text,
    );
    let out = call_llm(&prompt, None).await;
    log::info!("[LLM] get_goal_analysis_text done success={}", out.is_ok());
    out
}

/// Internal: get daily analysis text from LLM for a concatenated activities string.
pub async fn get_daily_analysis_text(activities_text: String) -> Result<String, String> {
    if activities_text.trim().is_empty() {
        return Ok(String::new());
    }
    log::info!("[LLM] get_daily_analysis_text start len={}", activities_text.len());
    let prompt = prompt::build_daily_analysis_prompt(&activities_text);
    let out = call_llm(&prompt, None).await;
    log::info!("[LLM] get_daily_analysis_text done success={}", out.is_ok());
    out
}

/// Filter rule result to only requested ability names; missing keys get 0.
fn filter_rule_result_to_abilities(
    m: HashMap<String, i32>,
    ability_names: &[String],
) -> HashMap<String, i32> {
    ability_names
        .iter()
        .map(|name| (name.clone(), m.get(name).copied().unwrap_or(0)))
        .collect()
}

#[tauri::command]
pub async fn analyze_activity(
    content: String,
    ability_names: Vec<String>,
) -> Result<HashMap<String, i32>, String> {
    log::info!("analyze_activity: content_len={}, abilities={}", content.len(), ability_names.len());
    if ability_names.is_empty() {
        return Ok(HashMap::new());
    }

    // Try rule-based first; then filter to requested ability names
    if let Some(m) = rules::try_rule_based(&content) {
        log::info!("analyze_activity: rule-based result");
        return Ok(filter_rule_result_to_abilities(m, &ability_names));
    }

    log::info!("[LLM] analyze_activity calling");
    let prompt = prompt::build_prompt(&content, &ability_names);
    let response_text = call_llm(&prompt, None).await?;

    let json_str = response_text
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    let parsed: serde_json::Value = serde_json::from_str(json_str)
        .map_err(|e| format!("Failed to parse LLM JSON: {}", e))?;

    let obj = parsed.as_object().ok_or("Expected JSON object")?;

    let mut result = HashMap::new();
    for name in &ability_names {
        let val = obj
            .get(name)
            .and_then(|v| v.as_i64())
            .unwrap_or(0) as i32;
        result.insert(name.clone(), val);
    }
    log::info!("[LLM] analyze_activity success");
    Ok(result)
}
