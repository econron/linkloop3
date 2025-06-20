// Gamification system for tracking XP and phoneme scores

export interface PhonemeScore {
  phoneme: string;
  averageScore: number;
  totalAttempts: number;
  lastScore: number;
}

export interface GameProgress {
  totalXP: number;
  phonemeScores: Record<string, PhonemeScore>;
  completedStages: string[];
}

const STORAGE_KEY = 'linkloop_game_progress';

// XP rewards for different activities
export const XP_REWARDS = {
  UNIT_COMPLETE: 50,     // Completing a lecture unit
  QUIZ_CORRECT: 10,      // Each correct quiz answer
  QUIZ_COMPLETE: 30,     // Completing entire quiz
  PRACTICE_SENTENCE: 15, // Each practice sentence with good score (≥70)
  PRACTICE_COMPLETE: 50, // Completing entire practice session
  BONUS_MULTIPLIER: 2,   // Multiplier when phoneme score ≥90
};

// Load game progress from localStorage
export function loadGameProgress(): GameProgress {
  if (typeof window === 'undefined') {
    return {
      totalXP: 0,
      phonemeScores: {},
      completedStages: []
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading game progress:', error);
  }

  return {
    totalXP: 0,
    phonemeScores: {},
    completedStages: []
  };
}

// Save game progress to localStorage
export function saveGameProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving game progress:', error);
  }
}

// Add XP to the total
export function addXP(amount: number): void {
  const progress = loadGameProgress();
  progress.totalXP += amount;
  saveGameProgress(progress);
}

// Update phoneme score and return whether bonus should be applied
export function updatePhonemeScore(phoneme: string, score: number): boolean {
  const progress = loadGameProgress();
  
  if (!progress.phonemeScores[phoneme]) {
    progress.phonemeScores[phoneme] = {
      phoneme,
      averageScore: score,
      totalAttempts: 1,
      lastScore: score
    };
  } else {
    const current = progress.phonemeScores[phoneme];
    current.totalAttempts += 1;
    current.averageScore = (current.averageScore * (current.totalAttempts - 1) + score) / current.totalAttempts;
    current.lastScore = score;
  }
  
  saveGameProgress(progress);
  
  // Return true if bonus should be applied (average score ≥90)
  return progress.phonemeScores[phoneme].averageScore >= 90;
}

// Mark a stage as completed
export function markStageCompleted(stageId: string): void {
  const progress = loadGameProgress();
  if (!progress.completedStages.includes(stageId)) {
    progress.completedStages.push(stageId);
    saveGameProgress(progress);
  }
}

// Check if stage is completed
export function isStageCompleted(stageId: string): boolean {
  const progress = loadGameProgress();
  return progress.completedStages.includes(stageId);
}

// Get phoneme score for display
export function getPhonemeScore(phoneme: string): PhonemeScore | null {
  const progress = loadGameProgress();
  return progress.phonemeScores[phoneme] || null;
}

// Calculate XP for quiz completion
export function calculateQuizXP(correctAnswers: number, totalQuestions: number): number {
  const baseXP = (correctAnswers * XP_REWARDS.QUIZ_CORRECT) + XP_REWARDS.QUIZ_COMPLETE;
  return baseXP;
}

// Calculate XP for practice with bonus
export function calculatePracticeXP(score: number, phonemes: string[]): number {
  let baseXP = 0;
  
  if (score >= 70) {
    baseXP = XP_REWARDS.PRACTICE_SENTENCE;
  }
  
  // Check if any target phoneme has high average score for bonus
  let hasBonus = false;
  for (const phoneme of phonemes) {
    const phonemeScore = getPhonemeScore(phoneme);
    if (phonemeScore && phonemeScore.averageScore >= 90) {
      hasBonus = true;
      break;
    }
  }
  
  return hasBonus ? baseXP * XP_REWARDS.BONUS_MULTIPLIER : baseXP;
}

// Get total XP
export function getTotalXP(): number {
  const progress = loadGameProgress();
  return progress.totalXP;
}