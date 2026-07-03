import time
from typing import Dict, Any, List, Optional

def estimate_tokens(text: str) -> int:
    """
    Estimates token count for Qwen/GPT-like models without heavy tokenizers.
    Rule of thumb: 1 token ≈ 4 characters, or ~1.3 tokens per word.
    """
    if not text:
        return 0
    # Average of char-based and word-based estimations
    char_est = len(text) / 4.0
    word_est = len(text.split()) * 1.3
    return int((char_est + word_est) / 2.0) + 1

def format_sse_chunk(content: str, done: bool = False, usage: Optional[Dict[str, Any]] = None) -> str:
    """Format data for Server-Sent Events transmission."""
    data = {
        "content": content,
        "done": done,
        "usage": usage
    }
    return f"data: {json_dumps(data)}\n\n"

def json_dumps(obj: Any) -> str:
    # A safe helper for JSON serialization
    import json
    return json.dumps(obj)

def get_code_prompt(action: str, code: str, language: str, context: Optional[str] = None) -> str:
    """Returns specialized system/user prompts for code tasks."""
    prompt_templates = {
        "explain": (
            "You are an expert software engineer. Explain this code step-by-step. "
            "Highlight the flow of execution, core algorithms, and potential performance implications. "
            "Write the explanation in clear, readable markdown.\n\n"
            f"Language: {language}\n"
            f"Code:\n```\n{code}\n```"
        ),
        "debug": (
            "You are a senior debugger. Identify errors, logical bugs, edge cases, memory leaks, "
            "or security vulnerabilities in the code below. Explain each issue found and "
            "provide a corrected version of the code, indicating what changes were made.\n\n"
            f"Language: {language}\n"
            f"Code:\n```\n{code}\n```"
        ),
        "refactor": (
            "You are a principal engineer. Refactor this code to improve its readability, "
            "efficiency, and modularity. Adhere to SOLID principles and industry design patterns. "
            "Provide the refactored code and list the improvements.\n\n"
            f"Language: {language}\n"
            f"Code:\n```\n{code}\n```"
        ),
        "generate-tests": (
            "You are a QA automation lead. Write comprehensive unit tests for the following code snippet. "
            "Cover typical inputs, edge cases, and error conditions. Use standard testing libraries.\n\n"
            f"Language: {language}\n"
            f"Code:\n```\n{code}\n```"
        ),
        "summarize": (
            "Provide a brief, high-level summary of what this code does in 2-3 sentences. "
            "Focus on the main inputs, transformations, and outputs.\n\n"
            f"Language: {language}\n"
            f"Code:\n```\n{code}\n```"
        )
    }

    prompt = prompt_templates.get(action, f"Analyze the following code:\n\n```{language}\n{code}\n```")
    if context:
        prompt = f"Context/Instructions: {context}\n\n{prompt}"
    return prompt

def get_completion_prompt(prefix: str, suffix: str, language: str) -> str:
    """Constructs instructions for code completion."""
    return (
        f"You are a code auto-completion utility. Continue the code for the {language} language. "
        "Your task is to fill in the missing code between the Prefix and Suffix. "
        "Return ONLY the code that should be inserted directly at the transition point. "
        "Do NOT write any explanations. Do NOT wrap your response in markdown code blocks.\n\n"
        f"--- PREFIX ---\n{prefix}\n"
        f"--- SUFFIX ---\n{suffix}\n"
        "--- INSERT COMPLETED CODE BELOW ---"
    )
