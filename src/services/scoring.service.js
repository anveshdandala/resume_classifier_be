export default function calculateATSscore(resumeSkills, resumeExperience, jdKeywords = [], minExperienceReq = 0) {
  
  // 1. Handle Empty Case (Generic Profile Strength)
  if (!jdKeywords || jdKeywords.length === 0) {
    return calculateGenericStrength(resumeSkills, resumeExperience);
  }

  // --- WEIGHTS ---
  // Skills are usually 70-80% of the decision
  // Experience is 20-30%
  const SKILL_WEIGHT = 0.70;
  const EXP_WEIGHT = 0.30;

  // 2. Skill Match Score (0 to 100)
  // We normalize to lowercase to ensure "Python" matches "python"
  const normalizedResumeSkills = new Set(resumeSkills.map(s => s.toLowerCase()));
  const normalizedJdKeywords = jdKeywords.map(k => k.toLowerCase());

  // Count how many JD keywords exist in the Resume
  const matchedSkills = normalizedJdKeywords.filter(keyword => 
    normalizedResumeSkills.has(keyword)
  );

  // Calculate percentage of requirements met
  const skillMatchPercentage = matchedSkills.length / normalizedJdKeywords.length;
  const weightedSkillScore = skillMatchPercentage * 100 * SKILL_WEIGHT;


  // 3. Experience Match Score (0 to 100)
  let expScore = 0;
  if (minExperienceReq > 0) {
      if (resumeExperience >= minExperienceReq) {
          expScore = 100; // Perfect match
      } else {
          // Partial credit (e.g., 1 year vs 2 years req = 50%)
          expScore = (resumeExperience / minExperienceReq) * 100;
      }
  } else {
      // If no requirement specified, use a standard curve
      // e.g., 5 years is "Full Seniority" (100 points)
      expScore = Math.min((resumeExperience / 5) * 100, 100);
  }
  
  const weightedExpScore = expScore * EXP_WEIGHT;


  // 4. Final Score (Rounded)
  return Math.round(weightedSkillScore + weightedExpScore);
}

// Fallback function if no Job Description is provided
function calculateGenericStrength(skills, experience) {
  let score = 20; // Base points for having a resume
  score += Math.min(skills.length * 5, 50); // Max 50 pts for skills
  score += Math.min(experience * 10, 30);   // Max 30 pts for experience
  return Math.min(score, 100);
}