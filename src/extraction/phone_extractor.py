def extract_phone(text):
    try:
        # Find potential phone numbers
        for match in phonenumbers.PhoneNumberMatcher(text, "IN"): # Defaulting to IN for now, can be generic
            return phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.E164)
        
        # Fallback regex if phonenumbers fails or for other formats
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        matches = re.findall(phone_pattern, text)
        if matches:
            return ''.join(matches[0]) # Normalize this better if needed
            
    except Exception:
        pass
    return None
