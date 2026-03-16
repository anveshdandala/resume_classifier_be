import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline.resume_pipeline import parse_resume


def main():
    file_paths = sys.argv[1:]

    if not file_paths:
        print(json.dumps({"error": "No file paths provided"}))
        sys.exit(1)

    results = []
    has_error = False

    for file_path in file_paths:
        try:
            results.append(parse_resume(file_path))
        except Exception as exc:
            has_error = True
            results.append({"file": file_path, "error": str(exc)})

    print(json.dumps(results))
    if has_error:
        sys.exit(1)


if __name__ == "__main__":
    main()
