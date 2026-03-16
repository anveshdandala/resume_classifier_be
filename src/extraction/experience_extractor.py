import re
def extract_experience(text):
    # Very basic heuristic: look for "Years of Experience" or similar
    # Or calculate from dates (complex).
    # For now, let's look for explicit mentions
    
    # Pattern: "5+ years", "5 years", "5.5 years"
    pattern = r'(\d+(\.\d+)?)\+?\s*(?:years?|yrs?)'
    matches = re.search(pattern, text, re.IGNORECASE)
    if matches:
        try:
            return float(matches.group(1))
        except:
            pass
    return 0

