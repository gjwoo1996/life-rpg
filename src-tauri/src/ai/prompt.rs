pub fn build_prompt(activity: &str) -> String {
    format!(
        r#"Analyze the following user activity and assign experience points (XP) to each skill.
Activity: {}
Return ONLY a JSON object with integer values for these keys: intelligence, discipline, focus, knowledge, health.
Example: {{"intelligence": 4, "discipline": 3, "focus": 2, "knowledge": 3, "health": 0}}
Return only the JSON, no other text."#,
        activity
    )
}
