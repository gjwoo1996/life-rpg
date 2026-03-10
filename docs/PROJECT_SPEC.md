# AI Self Growth RPG Desktop Application

## 1. Project Vision

This project is a **desktop self-management application** that gamifies personal development.

The user becomes a **game character** and real-world actions (study, habits, productivity) translate into **experience points and character growth**.

The application combines:

* habit tracking
* AI analysis
* RPG mechanics
* pixel character progression

The goal is to transform self-improvement into an engaging RPG-like experience.

---

# 2. Core Concept

User = Character

Real activities → XP → Character growth

Example:

User activity log:

"Studied Japanese for 2 hours and learned 30 vocabulary words."

AI analysis result:

Intelligence +4 XP
Focus +2 XP
Discipline +1 XP

Total XP gained = 7

---

# 3. Main Features

## 3.1 Character System

Each user creates a character.

Character properties:

* level
* experience
* stats
* growth stage

Stats example:

* Intelligence
* Focus
* Discipline
* Knowledge
* Health

Character visual representation uses **pixel-art sprites**.

Character stages evolve with level.

Example:

Level 1–9 → stage1
Level 10–19 → stage2
Level 20–29 → stage3
Level 30–49 → stage4
Level 50+ → stage5

Sprites stored locally.

---

# 3.2 Goal System (D-Day Goals)

Users define time-based goals.

Example:

Goal:

"JLPT N2 Preparation"

Start date: 2026-03-10
End date: 2026-07-01

Target skills:

* Intelligence
* Discipline

Goal properties:

* duration
* skill targets
* progress tracking

---

# 3.3 Daily Activity Logging

Users log daily activities.

Example:

Date: 2026-03-10

Log content:

"Studied Japanese reading for 2 hours and memorized 30 vocabulary words."

This log is sent to the AI evaluation system.

---

# 3.4 AI Skill Evaluation

A **local LLM** analyzes activity logs.

Input:

User activity description.

Output:

XP distribution across stats.

Example output:

Intelligence +4
Discipline +3
Focus +1

XP updates:

* character XP
* stat increases
* level progress

---

# 3.5 Pixel Character Growth

Character appearance evolves as the user progresses.

Sprites stored in:

assets/characters/

Example:

stage1.png
stage2.png
stage3.png
stage4.png
stage5.png

---

# 3.6 Windows Activity Monitoring

The application monitors system processes.

Example use case:

Goal:

"Play League of Legends less than 1 hour per day."

Behavior:

1. Detect process start
2. Track runtime
3. If limit exceeded → terminate process

Example process:

LeagueClient.exe

---

# 3.7 Initial Character Setup

First launch includes a **character setup questionnaire**.

User describes:

* habits
* skills
* experience

System generates initial stats.

This process can only happen once per character.

---

# 3.8 Automatic Activity Tracking (Future Core Feature)

The application automatically tracks user activity.

Examples:

VSCode usage
Browser activity
Game usage
Learning platforms

Example daily summary:

VSCode: 3h
Browser: 2h
League of Legends: 1h

AI evaluation converts activity to XP.

---

# 4. Technology Stack

Desktop Framework:

Tauri

Frontend:

React
TailwindCSS
Zustand

Backend:

Rust

Database:

SQLite

Local AI:

Ollama

Recommended models:

phi3
mistral
qwen2.5

---

# 5. Development Environment

Required environment:

Cursor IDE
WSL2
Docker
DevContainer

Development container must include:

Node.js
Rust
Tauri CLI

---

# 6. System Architecture

Desktop Application

Tauri App
├─ React UI
├─ Rust Backend
│   ├─ Process monitoring
│   ├─ XP calculation
│   ├─ database access
│
└─ AI evaluation
│
└─ Ollama local LLM

---

# 7. Database Schema

Characters

id
name
level
xp
created_at

Stats

character_id
intelligence
focus
discipline
knowledge
health

Goals

goal_id
character_id
name
start_date
end_date
target_skill

ActivityLogs

log_id
character_id
date
content
ai_result
xp_gained

---

# 8. AI Evaluation Pipeline

User log
↓
Send to local LLM
↓
AI returns XP distribution
↓
Update stats
↓
Update level

---

# 9. Pixel Character System

Sprites stored locally.

Example folder:

assets/characters/

Stages:

stage1.png
stage2.png
stage3.png
stage4.png
stage5.png

Level mapping:

1–9 → stage1
10–19 → stage2
20–29 → stage3
30–49 → stage4
50+ → stage5

---

# 10. Build Target

The application must compile into a Windows executable.

Build command:

npm run tauri build

Output example:

src-tauri/target/release/app.exe

---

# 11. Agile Development Plan

Development will follow iterative phases.

Phase 1 (MVP):

Character creation
Goal creation
Daily log
XP system
Pixel character display

Phase 2:

AI evaluation
Ollama integration

Phase 3:

Windows activity tracking

Phase 4:

Automatic productivity tracking

Phase 5:

Advanced RPG features
