import { PhonemeErrorSummary } from '@prisma/client';

export interface AzurePronunciationResponse {
  NBest: Array<{
    Words: Array<{
      Word: string;
      Phonemes: Array<{
        Phoneme: string;
        PronunciationAssessment: {
          ErrorType: string;
          AccuracyScore?: number;
          NBestPhonemes?: Array<{
            Phoneme: string;
            Score?: number;
          }>;
        };
      }>;
    }>;
    PronunciationAssessment: {
      PronScore: number;
      AccuracyScore: number;
      FluencyScore: number;
      ProsodyScore: number;
    };
  }>;
}

export interface PronunciationHabit {
  phoneme: string;
  confusedWith: string;
  accuracyScore: number;
  lastOccurredAt: Date;
}

export interface PhonemeErrorPair {
  intendedPhoneme: string;
  actualPhoneme: string;
}

export type PhonemeErrorSummaryResponse = Pick<
  PhonemeErrorSummary,
  'intendedPhoneme' | 'actualPhoneme' | 'errorCount' | 'lastOccurredAt'
>; 