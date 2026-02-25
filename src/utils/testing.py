import spacy
import re

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = spacy.blank("en") # Fallback if model missing

def extract_name(text):
    """
    Extracts name by scanning the top lines and skipping headers.
    """
    # 1. Split text into non-empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # 2. Define patterns to SKIP (Headers, Contact labels)
    # If a line contains these, it is NOT a name.
    SKIP_KEYWORDS = {"curriculum", "vitae", "resume", "cv", "bio", "profile", "summary"}
    
    for line in lines[:10]: # Only check the first 10 lines
        line_lower = line.lower()
        
        # Check A: Is this line a Header? (e.g., "CURRICULUM VITAE")
        if any(keyword in line_lower for keyword in SKIP_KEYWORDS):
            continue # Skip this line, go to next
            
        # Check B: Is it contact info? (e.g., "Email: ...")
        if "@" in line or re.search(r'\d', line): # Names rarely have numbers
            continue

        # Check C: Is it a Job Title? (Heuristic)
        # If the line is "Software Engineer", skip it.
        # This is hard without a list, but usually, the name comes BEFORE the title.
        # We assume the FIRST valid line we hit is the name.
        
        # Check D: Structure Validation
        # A name usually has 2-4 words. "P Ram" is 2 words. "Anvesh" is 1 (risky but possible).
        words = line.split()
        if 1 <= len(words) <= 4:
            # We found a line that isn't a header, isn't contact info, and looks like a name.
            # Double check with spaCy just in case it's a known entity
            doc = nlp(line)
            if doc.ents and doc.ents[0].label_ == "ORG":
                # If spaCy strongly thinks it's a Company (e.g., "Google"), skip it.
                continue
                
            return line # Return the first valid candidate

    return None

# --- Testing ---
if __name__ == "__main__":
    resume_text_3 = """
    CURRICULUM VITAE
    p John smith
    Data Scientist
    """
    
    print(f"Extracted Name: '{extract_name(resume_text_3)}'")