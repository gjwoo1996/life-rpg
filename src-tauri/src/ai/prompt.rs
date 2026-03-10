pub fn build_summary_prompt(content: &str) -> String {
    format!(
        r#"Summarize the following activity in one short sentence (under 80 characters). Reply with only the summary, no quotes or prefix.
Activity: {}
Summary:"#,
        content
    )
}

pub fn build_daily_analysis_prompt(activities_text: &str) -> String {
    format!(
        r#"The following are the user's activity logs for one day. Write a brief 2-3 sentence analysis of the day (what was done, progress, or encouragement). Reply in the same language as the activities.
Activities:
{}
Analysis:"#,
        activities_text
    )
}

pub fn build_prompt(activity: &str, ability_names: &[String]) -> String {
    if ability_names.is_empty() {
        return String::new();
    }
    let keys: String = ability_names
        .iter()
        .map(|s| format!("\"{}\"", s))
        .collect::<Vec<_>>()
        .join(", ");
    let example: String = ability_names
        .iter()
        .enumerate()
        .map(|(i, s)| format!("\"{}\": {}", s, (i + 1) % 4))
        .collect::<Vec<_>>()
        .join(", ");
    format!(
        r#"Analyze the following user activity and assign experience points (XP) to each skill.
Activity: {}
Return ONLY a JSON object with integer values (0-10) for these keys: {}.
Example: {{{}}}
Return only the JSON, no other text."#,
        activity, keys, example
    )
}
