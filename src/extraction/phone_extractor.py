import re
from typing import Optional

import phonenumbers


def extract_phone(text: str) -> Optional[str]:
    if not text:
        return None

    try:
        # First pass: libphonenumber-based extraction
        for match in phonenumbers.PhoneNumberMatcher(text, None):
            if phonenumbers.is_possible_number(match.number):
                return phonenumbers.format_number(
                    match.number,
                    phonenumbers.PhoneNumberFormat.E164,
                )

        # Fallback regex for common 10-digit style numbers
        phone_pattern = r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}"
        match = re.search(phone_pattern, text)
        if match:
            raw = re.sub(r"\D", "", match.group(0))
            if len(raw) >= 10:
                return raw[-10:]

    except Exception:
        return None

    return None
