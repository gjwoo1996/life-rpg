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

/// Goal name, target ability, optional previous context/summary, and recent activities.
/// Used for cumulative goal analysis (progress, what to improve, encouragement).
pub fn build_goal_analysis_prompt(
    goal_name: &str,
    target_ability: &str,
    previous_context: &str,
    activities_text: &str,
) -> String {
    format!(
        r#"Analyze progress toward this goal and give brief feedback.
Goal: {}
Target skill/ability: {}
{}

Recent activities:
{}

Write 2-4 sentences: progress so far, what to improve, and encouragement. Reply in the same language as the activities. No prefix or label."#,
        goal_name,
        target_ability,
        if previous_context.is_empty() {
            String::new()
        } else {
            format!("Previous summary/context:\n{}\n", previous_context)
        },
        if activities_text.is_empty() {
            "(No activities yet)".to_string()
        } else {
            activities_text.to_string()
        }
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
