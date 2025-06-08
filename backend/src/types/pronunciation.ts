import { PhonemeErrorSummary } from '@prisma/client';

export interface AzurePronunciationResponse {
  NBest: Array<{
    Words: Array<{
      Word: string;
      Phonemes: Array<{
        Phoneme: string;
        PronunciationAssessment: {
          ErrorType: string;
          NBestPhonemes?: Array<{
            Phoneme: string;
          }>;
        };
      }>;
    }>;
  }>;
}

export interface PhonemeErrorPair {
  intendedPhoneme: string;
  actualPhoneme: string;
}

export type PhonemeErrorSummaryResponse = Pick<
  PhonemeErrorSummary,
  'intendedPhoneme' | 'actualPhoneme' | 'errorCount' | 'lastOccurredAt'
>; 