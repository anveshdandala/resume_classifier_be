import os
from .docx_parser import parse_docx

def extract_text(file_path):

    ext = os.path.splitext(file_path)[1].lower()

    # if ext == ".pdf":
    #     return parse_pdf(file_path)

    if ext == ".docx":
        extracted_text = parse_docx(file_path)
        print("docx extracted text:", )
        return extracted_text
    
    raise ValueError("Unsupported file type")