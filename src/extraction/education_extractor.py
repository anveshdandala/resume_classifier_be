import re
from typing import List, Optional

EDUCATION_PATTERNS = [
    r"\bph\.?d\b",
    r"\bdoctorate\b",
    r"\bm\.?tech\b",
    r"\bm\.?sc\b",
    r"\bmaster(?:'s)?\b",
    r"\bms\b",
    r"\bmba\b",
    r"\bb\.?tech\b",
    r"\bb\.?e\b",
    r"\bb\.?sc\b",
    r"\bbachelor(?:'s)?\b",
    r"\bdiploma\b",
]


def extract_education(text: str) -> Optional[List[str]]:
    if not text:
        return None

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    matches: List[str] = []

    for line in lines:
        line_lower = line.lower()
        if any(re.search(pattern, line_lower) for pattern in EDUCATION_PATTERNS):
            matches.append(line)

    # Remove duplicates while preserving order
    deduped = list(dict.fromkeys(matches))
    return deduped or None
