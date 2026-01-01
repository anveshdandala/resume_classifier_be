export function calculateScore(skills, experience) {
  let score = 50;
  score += skills.length * 10;
  score += experience * 5;
  return Math.min(score, 100);
}
