import sys
import json
import pathlib
import os
import re
import logging


def extract_text_from_pdf(file_path):
    try:
        from pdfminer.high_level import extract_text
    except ImportError as exc:
        raise ImportError("Missing dependency 'pdfminer.six' for PDF parsing") from exc

    return extract_text(file_path)


def extract_text_from_docx(file_path):
    try:
        import docx
    except ImportError as exc:
        raise ImportError("Missing dependency 'python-docx' for DOCX parsing") from exc

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
        import phonenumbers

        for match in phonenumbers.PhoneNumberMatcher(text, "IN"):
            return phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.E164)
    except Exception:
        pass

    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    matches = re.findall(phone_pattern, text)
    if matches:
        return ''.join(matches[0])

    return None


def extract_name(text):
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        return lines[0]
    return None


def extract_skills(text):
    common_skills = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "NoSQL",
        "MongoDB", "PostgreSQL", "React", "Angular", "Vue", "Node.js", "Express",
        "Django", "Flask", "Spring Boot", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "Git", "CI/CD", "HTML", "CSS", "Machine Learning", "Data Analysis", "Artificial Intelligence"
    ]

    found_skills = set()
    text_lower = text.lower()

    for skill in common_skills:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)

    return list(found_skills)


def extract_education(text):
    education_keywords = ["Bachelor", "Master", "PhD", "B.Sc", "M.Sc", "B.Tech", "M.Tech", "MBA", "Diploma"]
    text_lower = text.lower()
    for keyword in education_keywords:
        if keyword.lower() in text_lower:
            return keyword
    return None


def extract_experience(text):
    pattern = r'(\d+(\.\d+)?)\+?\s*(?:years?|yrs?)'
    matches = re.search(pattern, text, re.IGNORECASE)
    if matches:
        try:
            return float(matches.group(1))
        except Exception:
            pass
    return 0


def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("No file path provided")

        file_path = sys.argv[1]
        file_extension = os.path.splitext(file_path)[1].lower()

        file = pathlib.Path(file_path)
        if not file.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        if file_extension == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif file_extension in ['.docx', '.doc']:
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

        result = {
            "skills_found": extract_skills(text),
            "experience": extract_experience(text),
            "name": extract_name(text),
            "email": extract_email(text),
            "degree": extract_education(text),
            "company_names": [],
            "raw_text": text,
        }

        logging.info(f"Result: {json.dumps(result)}")
        print(json.dumps(result))

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    logging.basicConfig(filename='parser.log', level=logging.DEBUG)
    logging.info("Starting parser execution")
    main()
