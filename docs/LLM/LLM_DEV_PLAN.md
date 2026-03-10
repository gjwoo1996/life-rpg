# Local LLM Development Plan

This document defines the development plan for integrating a **local Large Language Model (LLM)** into the Self Growth RPG desktop application.

The LLM is used to analyze user activity logs and convert them into **character experience points (XP)**.

The LLM must run **locally using Docker** and must be accessible from the Rust backend.

---

# 1. Goals

The local LLM will perform the following tasks:

1. Analyze user activity logs
2. Identify relevant skill improvements
3. Convert activities into XP values
4. Return structured output

Example:

Input:

User activity log

```
Studied Japanese reading for 2 hours and memorized 30 vocabulary words.
```

Expected output:

```
intelligence: 4
discipline: 3
focus: 2
```

---

# 2. Model Requirements

The model must satisfy the following constraints:

* small memory footprint
* fast inference
* capable of reasoning over short text
* good instruction following

The model will run locally on a consumer GPU.

Target hardware example:

RTX 4060
RTX 4060 Ti
RTX 3070

---

# 3. Recommended Model

The primary recommended model is:

**phi3-mini**

Reason:

* very fast inference
* small memory footprint
* good instruction following
* suitable for local inference

Alternative models:

qwen2.5:7b
mistral:7b

---

# 4. LLM Runtime

The LLM runtime must use **Ollama**.

Reasons:

* easy model management
* simple API interface
* Docker compatible
* good community support

Ollama exposes a REST API.

Default endpoint:

```
http://localhost:11434
```

---

# 5. DevContainer Integration

The DevContainer must support development of the AI integration.

However, the LLM runtime itself will run as a **separate Docker service**.

Architecture:

```
DevContainer
 ├─ Rust backend
 ├─ React frontend
 └─ AI client module
        │
        │ HTTP request
        ▼
Ollama Docker container
        │
        ▼
Local LLM
```

---

# 6. Docker Service for Ollama

Add an additional service in the docker-compose configuration.

Example:

```
services:

  workspace:
    build:
      context: .
      dockerfile: Dockerfile

    volumes:
      - ..:/workspace

    command: sleep infinity

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
```

---

# 7. Model Installation

After starting the Ollama container, install the model.

Example command:

```
docker exec -it ollama ollama pull phi3
```

Alternative models:

```
ollama pull qwen2.5:7b
ollama pull mistral
```

---

# 8. Rust AI Client

The Rust backend will communicate with Ollama via HTTP.

Recommended Rust libraries:

reqwest
serde
tokio

Example Rust request:

```
POST http://localhost:11434/api/generate
```

Example request body:

```
{
  "model": "phi3",
  "prompt": "Analyze this activity and assign XP",
  "stream": false
}
```

---

# 9. Structured Output Requirement

The AI must return structured JSON.

Expected format:

```
{
  "intelligence": 4,
  "discipline": 3,
  "focus": 2
}
```

This allows direct parsing in Rust.

---

# 10. Prompt Strategy

The AI prompt must include:

* activity description
* skill categories
* instruction to return JSON

Example prompt:

```
Analyze the following user activity and assign experience points.

Activity:
Studied Japanese reading for 2 hours.

Return JSON with XP values for:
intelligence
discipline
focus
knowledge

Return only JSON.
```

---

# 11. Performance Considerations

Expected inference time:

1–3 seconds per request

Daily requests expected:

1–10 per user

This workload is suitable for local LLM inference.

---

# 12. Future Improvements

Future versions may include:

* activity classification
* productivity scoring
* AI coaching feedback
* automatic activity recognition

---

# 13. Implementation Tasks

Cursor should implement the following steps:

1. Extend docker-compose with Ollama service
2. Ensure port 11434 is exposed
3. Create Rust AI client module
4. Implement activity analysis function
5. Parse JSON response into XP structure
6. Integrate XP calculation into character system
