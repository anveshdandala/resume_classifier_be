import re
from datetime import datetime
from typing import Optional


def _extract_explicit_years(text: str) -> Optional[float]:
    pattern = r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\b"
    matches = re.findall(pattern, text, flags=re.IGNORECASE)
    if not matches:
        return None
    return max(float(m) for m in matches)


def _estimate_from_date_ranges(text: str) -> float:
    # Handles common ranges like: 2019-2022, 08/2021 - Present, Jan 2020 to Mar 2023
    current_year = datetime.now().year

    year_range_pattern = r"(19\d{2}|20\d{2})\s*(?:-|to|–|—)\s*(present|current|now|19\d{2}|20\d{2})"
    ranges = re.findall(year_range_pattern, text, flags=re.IGNORECASE)

    total_years = 0.0
    for start, end in ranges:
        start_year = int(start)
        end_norm = end.lower()
        end_year = current_year if end_norm in {"present", "current", "now"} else int(end)
        if end_year >= start_year:
            total_years += end_year - start_year

    return round(total_years, 1)


def extract_experience(text: str) -> float:
    if not text:
        return 0.0

    explicit = _extract_explicit_years(text)
    if explicit is not None:
        return explicit

    estimated = _estimate_from_date_ranges(text)
    return estimated if estimated > 0 else 0.0
