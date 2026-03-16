import sys
import os
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline.resume_pipeline import parse_resume


def main():

    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        result = parse_resume(file_path)
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()