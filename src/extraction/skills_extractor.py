def extract_skills(text):
    # A predefined list of common skills to look for
    # In a real app, this should be a comprehensive database or ML model
    common_skills = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "NoSQL", 
        "MongoDB", "PostgreSQL", "React", "Angular", "Vue", "Node.js", "Express", 
        "Django", "Flask", "Spring Boot", "AWS", "Azure", "GCP", "Docker", "Kubernetes", 
        "Git", "CI/CD", "HTML", "CSS", "Machine Learning", "Data Analysis", "Artificial Intelligence"
    ]
    
    found_skills = set()
    text_lower = text.lower()
    
    for skill in common_skills:
        # Use regex to find whole words to avoid partial matches (e.g., "Java" in "JavaScript" - actually strictly mostly distinctive but "C" in "CSS" etc.)
        # Escaping skill name for regex safety
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)
            
    return list(found_skills)
