def extract_education(text):
    # logic to search for degrees
    education_keywords = ["Bachelor", "Master", "PhD", "B.Sc", "M.Sc", "B.Tech", "M.Tech", "MBA", "Diploma"]
    text_lower = text.lower()
    for keyword in education_keywords:
        if keyword.lower() in text_lower:
            # Try to grab the context or line
            # distinct check? 
            return keyword # For now just return the degree type detected
    return None
