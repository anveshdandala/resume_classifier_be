import os

from .docx_parser import parse_docx
from .pdf_parser import extract_text_from_pdf


def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)

    if ext == ".docx":
        return parse_docx(file_path)

    raise ValueError(f"Unsupported file type: {ext}")
