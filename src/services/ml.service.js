const DOMAIN_CORPORA = {
  "Java Developer": [
    "java spring springboot hibernate junit maven gradle microservices rest api jdbc",
    "backend development java j2ee multithreading oops design patterns",
  ],
  "Data Scientist": [
    "python pandas numpy scikit learn tensorflow pytorch machine learning statistics",
    "data analysis feature engineering model training nlp deep learning",
  ],
  "Frontend Developer": [
    "javascript typescript react angular vue html css redux webpack",
    "ui ux responsive design frontend testing jest cypress",
  ],
  "DevOps Engineer": [
    "docker kubernetes aws azure gcp terraform ansible ci cd monitoring",
    "linux scripting cloud infrastructure automation devops",
  ],
};

const TOKEN_PATTERN = /[a-zA-Z][a-zA-Z0-9+#.-]{1,}/g;

function tokenize(text = "") {
  const matches = text.toLowerCase().match(TOKEN_PATTERN);
  return matches ?? [];
}

function termFrequency(tokens) {
  const tf = new Map();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

function inverseDocumentFrequency(documents) {
  const docCount = documents.length;
  const tokenDocumentHits = new Map();

  for (const tokens of documents) {
    const unique = new Set(tokens);
    for (const token of unique) {
      tokenDocumentHits.set(token, (tokenDocumentHits.get(token) ?? 0) + 1);
    }
  }

  const idf = new Map();
  for (const [token, hits] of tokenDocumentHits.entries()) {
    idf.set(token, Math.log((1 + docCount) / (1 + hits)) + 1);
  }

  return idf;
}

function tfidfVector(tokens, idfMap) {
  const tf = termFrequency(tokens);
  const totalTerms = tokens.length || 1;
  const vector = new Map();

  for (const [token, count] of tf.entries()) {
    const idf = idfMap.get(token) ?? 0;
    vector.set(token, (count / totalTerms) * idf);
  }

  return vector;
}

function cosineSimilarity(a, b) {
  if (!a.size || !b.size) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;

  const [smaller, larger] = a.size < b.size ? [a, b] : [b, a];
  for (const [token, value] of smaller.entries()) {
    dot += value * (larger.get(token) ?? 0);
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denominator) return 0;

  return dot / denominator;
}

function buildDomainVectors() {
  const domainDocuments = Object.values(DOMAIN_CORPORA).map((docs) => tokenize(docs.join(" ")));
  const idfMap = inverseDocumentFrequency(domainDocuments);

  const domainVectors = new Map();
  for (const [domain, docs] of Object.entries(DOMAIN_CORPORA)) {
    const tokens = tokenize(docs.join(" "));
    domainVectors.set(domain, tfidfVector(tokens, idfMap));
  }

  return { domainVectors, idfMap };
}

const { domainVectors, idfMap: baseIdfMap } = buildDomainVectors();

export function classifyResumeDomain(resumeText) {
  const resumeTokens = tokenize(resumeText);
  const resumeVector = tfidfVector(resumeTokens, baseIdfMap);

  let bestDomain = "General";
  let bestScore = 0;
  const probabilities = {};

  for (const [domain, vector] of domainVectors.entries()) {
    const score = cosineSimilarity(resumeVector, vector);
    probabilities[domain] = Number(score.toFixed(4));

    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }

  return {
    predictedDomain: bestDomain,
    confidence: Number((bestScore * 100).toFixed(2)),
    probabilities,
  };
}

export function rankAgainstJobDescription(resumeText, jobDescription = "") {
  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jobDescription);

  const jointIdf = inverseDocumentFrequency([resumeTokens, jdTokens]);
  const resumeVector = tfidfVector(resumeTokens, jointIdf);
  const jdVector = tfidfVector(jdTokens, jointIdf);

  const similarity = cosineSimilarity(resumeVector, jdVector);
  return Number((similarity * 100).toFixed(2));
}

export function calculateAtsScore({ domainConfidence, jdSimilarity, skillsCount, experienceYears }) {
  const normalizedExperience = Math.min(Number(experienceYears || 0), 12) / 12;
  const normalizedSkills = Math.min(Number(skillsCount || 0), 20) / 20;

  const score =
    domainConfidence * 0.35 +
    jdSimilarity * 0.45 +
    normalizedSkills * 100 * 0.15 +
    normalizedExperience * 100 * 0.05;

  return Math.round(Math.min(100, Math.max(0, score)));
}
