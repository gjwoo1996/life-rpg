export interface Character {
  id: number;
  name: string;
  level: number;
  xp: number;
  created_at: string;
}

export interface Stats {
  character_id: number;
  intelligence: number;
  focus: number;
  discipline: number;
  knowledge: number;
  health: number;
}

export interface Goal {
  goal_id: number;
  character_id: number;
  name: string;
  start_date: string;
  end_date: string;
  target_skill: string;
  calendar_color: string;
}

export interface Ability {
  ability_id: number;
  character_id: number;
  name: string;
}

export interface AbilityStat {
  ability_id: number;
  name: string;
  xp: number;
}

export interface ActivityLog {
  log_id: number;
  character_id: number;
  date: string;
  content: string;
  summary: string | null;
  ai_result: string | null;
  xp_gained: number;
}
