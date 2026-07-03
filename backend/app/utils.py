import json
from typing import Dict, Any, Optional

def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return int(len(text) / 4) + 1

def format_sse_chunk(content: str, done: bool = False, usage: Optional[Dict[str, Any]] = None) -> str:
    data = {"content": content, "done": done, "usage": usage}
    return f"data: {json.dumps(data)}\n\n"

def get_completion_prompt(prefix: str, suffix: str, language: str) -> str:
    return (
        f"Continue the code for the {language} language. "
        f"Fill in the missing code between the Prefix and Suffix. "
        f"Return ONLY the code to insert. No explanations, no markdown.\n\n"
        f"--- PREFIX ---\n{prefix}\n"
        f"--- SUFFIX ---\n{suffix}\n"
        "--- INSERT COMPLETED CODE BELOW ---"
    )
