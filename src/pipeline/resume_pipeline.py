from ingestion.text_extractor import extract_text

from extraction.email_extractor import extract_email
from extraction.phone_extractor import extract_phone
from extraction.skills_extractor import extract_skills
from extraction.education_extractor import extract_education
from extraction.experience_extractor import extract_experience


def parse_resume(file_path):
    text = extract_text(file_path)

    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)

    # Keep aliases for downstream JS compatibility
    return {
        "email": email,
        "phone": phone,
        "skills": skills,
        "skills_found": skills,
        "education": education,
        "experience": experience,
    }
