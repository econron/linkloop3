export type StageType = 'lecture' | 'perception' | 'production';

export interface QuizQuestion {
  word1: string;
  word2: string;
  audio1?: string;
  audio2?: string;
}

export interface PracticeSentence {
  text: string;
  targetWords: string[];
}

export interface CompetencyStage {
  id: string;
  type: StageType;
  title: string;
  description: string;
  competency: string;
  content?: {
    lecture?: {
      title: string;
      points: string[];
    };
    quiz?: {
      questions: QuizQuestion[];
      passingScore: number;
    };
    practice?: {
      sentences: PracticeSentence[];
      passingScore: number;
      targetPhonemes: string[];
    };
  };
  unlocked: boolean;
  completed: boolean;
  score?: number;
}

export interface Competency {
  id: string;
  title: string;
  description: string;
  phonemes: string[];
  stages: CompetencyStage[];
}

export interface CurriculumData {
  competencies: Competency[];
}