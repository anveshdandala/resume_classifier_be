import re
from difflib import SequenceMatcher
from typing import Dict, List, Set

# Canonical skills with common aliases/variants
SKILL_ALIASES: Dict[str, List[str]] = {
    "Python": ["python", "py"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript", "ts"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp"],
    "SQL": ["sql", "mysql", "postgresql", "sqlite"],
    "MongoDB": ["mongodb", "mongo db"],
    "React": ["react", "reactjs", "react.js"],
    "Angular": ["angular", "angularjs"],
    "Node.js": ["node", "nodejs", "node.js"],
    "Express": ["express", "expressjs"],
    "Django": ["django"],
    "Flask": ["flask"],
    "Spring Boot": ["spring boot", "springboot"],
    "AWS": ["aws", "amazon web services"],
    "Azure": ["azure", "microsoft azure"],
    "GCP": ["gcp", "google cloud", "google cloud platform"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Git": ["git", "github", "gitlab", "bitbucket"],
    "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
    "Machine Learning": ["machine learning", "ml"],
    "Data Analysis": ["data analysis", "data analytics"],
    "Artificial Intelligence": ["artificial intelligence", "ai"],
    "NLP": ["nlp", "natural language processing"],
}


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _ngram_tokens(text: str, max_n: int = 4) -> Set[str]:
    words = re.findall(r"[a-zA-Z0-9+#.]+", _normalize(text))
    grams: Set[str] = set(words)

    for n in range(2, max_n + 1):
        for i in range(len(words) - n + 1):
            grams.add(" ".join(words[i : i + n]))

    return grams


def _is_fuzzy_match(candidate: str, tokens: Set[str], threshold: float = 0.9) -> bool:
    # Small fuzzy layer helps catch minor OCR/parser typos ("javascrpt" -> JavaScript)
    for token in tokens:
        if abs(len(token) - len(candidate)) > 2:
            continue
        if SequenceMatcher(None, candidate, token).ratio() >= threshold:
            return True
    return False


def extract_skills(text: str) -> List[str]:
    if not text:
        return []

    text_norm = _normalize(text)
    ngrams = _ngram_tokens(text_norm)
    found: Set[str] = set()

    for canonical_skill, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            alias_norm = _normalize(alias)
            if alias_norm in ngrams or _is_fuzzy_match(alias_norm, ngrams):
                found.add(canonical_skill)
                break

    return sorted(found)
