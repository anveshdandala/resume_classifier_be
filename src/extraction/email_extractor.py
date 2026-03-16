import re
from typing import Optional


def extract_email(text: str) -> Optional[str]:
    if not text:
        return None

    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else None
