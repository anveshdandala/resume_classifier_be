import sys
import json
import pathlib
import os
import re
import logging
from pdfminer.high_level import extract_text
import docx
import phonenumbers

def extract_text_from_pdf(file_path):
    pdf_text = extract_text(file_path)
    return pdf_text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)


def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def extract_email(text):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else None

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

def extract_name(text):
    # Heuristic: The name is often at the very top of the resume
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        # Assumes the first non-empty line is the name
        # A bit naive but works for many standard resume templates
        return lines[0] 
    return None

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

def extract_companies(text):
     # Without NER, this is hard. We can return an empty list or placeholder.
     # Or maybe look for common company names if we had a list.
     return []


def main():
    testing_file_path = "data/resumes/testing_resume.docx"
    try:
        #comment this condition when testing
        if len(sys.argv) < 2:
            raise ValueError("No file path provided")

        file_path = sys.argv[1]  # receive file path from Node
        file_extension = os.path.splitext(file_path)[1].lower()

        file = pathlib.Path(file_path)
        if not file.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        text = ""
        if file_extension == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif file_extension in ['.docx', '.doc']:
             # doc support requires more tools, but docx is handled by python-docx
             # For .doc, usually antiword or similar is needed. We'll stick to .docx for now based on requirements.
             if file_extension == '.docx':
                 text = extract_text_from_docx(file_path)
             else:
                 raise ValueError("Unsupported legacy .doc format, please convert to .docx or .pdf")
        elif file_extension == '.txt':
            text = extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        if not text:
             raise ValueError("Could not extract text from file")

        # Extract info
        name = extract_name(text)
        email = extract_email(text)
        phone = extract_phone(text)
        skills = extract_skills(text)
        education = extract_education(text)
        experience = extract_experience(text)
        # companies = extract_companies(text)

        result = {
            "skills_found": skills,
            "experience": experience,
            "name": name,
            "email": email,
            "degree": education,
            "company_names": [], # Placeholder
            "raw_text": text,
        }

        logging.info(f"Result: {json.dumps(result)}")
        print(json.dumps(result))

    except Exception as e:
        # print error to stderr? or just return json error?
        # The existing code returned json error.
        logging.error(f"Error: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(filename='parser.log', level=logging.DEBUG)
    logging.info("Starting parser execution")
    main()
