use regex::Regex;
use std::collections::HashMap;

/// Try to match simple patterns and return XP distribution.
/// Returns None if no rule matches (call LLM).
pub fn try_rule_based(content: &str) -> Option<HashMap<String, i32>> {
    let content_lower = content.to_lowercase();

    // Pattern: "단어 N개" or "N개 단어"
    if let Ok(re) = Regex::new(r"(\d+)\s*개?\s*단어|단어\s*(\d+)\s*개?") {
        if let Some(cap) = re.captures(&content_lower) {
            let n: i32 = cap
                .get(1)
                .or_else(|| cap.get(2))
                .and_then(|m| m.as_str().parse().ok())
                .unwrap_or(0);
            if n > 0 {
                let xp = (n as f32 * 0.1).max(1.0) as i32;
                let mut m = HashMap::new();
                m.insert("intelligence".into(), xp);
                m.insert("discipline".into(), xp / 2);
                m.insert("focus".into(), 0);
                m.insert("knowledge".into(), xp / 2);
                m.insert("health".into(), 0);
                return Some(m);
            }
        }
    }

    // Pattern: "N시간 공부" or "공부 N시간"
    if let Ok(re) = Regex::new(r"(\d+)\s*시간") {
        if let Some(cap) = re.captures(&content_lower) {
            if let Ok(n) = cap.get(1).unwrap().as_str().parse::<i32>() {
                if n > 0 && (content_lower.contains("공부") || content_lower.contains("학습") || content_lower.contains("study")) {
                    let xp = (n * 2).max(1);
                    let mut m = HashMap::new();
                    m.insert("intelligence".into(), xp);
                    m.insert("discipline".into(), xp);
                    m.insert("focus".into(), xp / 2);
                    m.insert("knowledge".into(), xp);
                    m.insert("health".into(), 0);
                    return Some(m);
                }
            }
        }
    }

    // Pattern: "N분" exercise/운동 -> health
    if content_lower.contains("운동") || content_lower.contains("exercise") {
        if let Ok(re) = Regex::new(r"(\d+)\s*분") {
            if let Some(cap) = re.captures(&content_lower) {
                if let Ok(n) = cap.get(1).unwrap().as_str().parse::<i32>() {
                    let xp = (n / 10).max(1);
                    let mut m = HashMap::new();
                    m.insert("intelligence".into(), 0);
                    m.insert("discipline".into(), xp / 2);
                    m.insert("focus".into(), 0);
                    m.insert("knowledge".into(), 0);
                    m.insert("health".into(), xp);
                    return Some(m);
                }
            }
        }
    }

    None
}
