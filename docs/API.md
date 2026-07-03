# API Reference Documentation 📖

This document details the REST API specifications for the Antigravity Coding Assistant.

All APIs use JSON request bodies. Streaming endpoints support Server-Sent Events (`text/event-stream`).

---

## Endpoints Summary

| Method | Path | Description | Streaming Support |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat` | Chat message handler | Yes |
| `POST` | `/complete` | Code auto-completion | Yes |
| `POST` | `/explain` | Generates explanation for a code block | Yes |
| `POST` | `/debug` | Locates bugs and provides fixes | Yes |
| `POST` | `/refactor` | Refactors code for quality & SOLID rules | Yes |
| `POST` | `/generate-tests`| Creates automated unit tests | Yes |
| `POST` | `/summarize` | Summarizes code in 2-3 sentences | Yes |
| `GET` | `/health` | Check backend service health | No |
| `GET` | `/metrics` | Get performance metrics telemetry | No |
| `GET` | `/model-info` | Check active LLM provider specifications| No |

---

## Detailed Specifications

### 1. POST `/chat`
Generates conversational assistance based on prompt history.

**Request Payload:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a coding assistant." },
    { "role": "user", "content": "Write a bubble sort in Python." }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 0.9,
  "stream": true
}
```

---

### 2. POST `/complete`
Fills in missing code between a prefix and suffix (Fill-in-the-Middle).

**Request Payload:**
```json
{
  "prefix": "def add_numbers(a, b):\n    ",
  "suffix": "\n\nprint(add_numbers(5, 10))",
  "language": "python",
  "max_tokens": 64,
  "temperature": 0.1,
  "stream": false
}
```

---

### 3. POST `/explain` | `/debug` | `/refactor` | `/generate-tests` | `/summarize`
Specialized endpoints for code-focused instructions.

**Request Payload:**
```json
{
  "code": "def double(x): return x * 2",
  "language": "python",
  "context": "Optimize this code",
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": true
}
```

---

## Response Formats

### Non-Streaming Response
Returned when `stream` parameter is `false`:
```json
{
  "id": "uuid-string-here",
  "content": "Generated text or code review block here",
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 128,
    "total_tokens": 170,
    "duration_ms": 1240,
    "tokens_per_second": 103.2
  },
  "model": "bartowski/Qwen2.5-Coder-0.5B-Instruct-GGUF"
}
```

### Streaming Response (SSE)
Returned when `stream` parameter is `true`. Standard SSE format:
```
data: {"content": "Hello", "done": false}

data: {"content": " World", "done": false}

data: {"content": "", "done": true, "usage": {"prompt_tokens": 12, "completion_tokens": 2, "total_tokens": 14, "duration_ms": 230, "tokens_per_second": 8.7}}
```
Each data line represents a single generated text token. The final SSE chunk contains `done: true` and the generation metrics.
