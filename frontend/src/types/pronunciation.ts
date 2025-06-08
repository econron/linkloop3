export interface FeedbackSection {
  title: string;
  content: string;
}

export interface FeedbackResponse {
  sections: FeedbackSection[];
}

export interface PronunciationAnalysis {
  id: number;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  prosodyScore: number;
  findings: {
    type: 'ERROR' | 'HABIT';
    phoneme: string;
    details: {
      actual?: string;
      confusedWith?: string;
      accuracyScore?: number;
    };
  }[];
} 