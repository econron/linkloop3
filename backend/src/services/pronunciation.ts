import { PrismaClient } from '@prisma/client';
import { AzurePronunciationResponse, PhonemeErrorPair, PronunciationHabit } from '../types/pronunciation';

const prisma = new PrismaClient();

export async function updatePronunciationSummary(
  userId: string,
  azureResponse: AzurePronunciationResponse
): Promise<void> {
  // 追加: Azureレスポンスの内容をログ出力
  console.log('updatePronunciationSummary: azureResponse =', JSON.stringify(azureResponse, null, 2));
  
  const errorPairs: PhonemeErrorPair[] = [];
  const habits: PronunciationHabit[] = [];
  
  for (const word of azureResponse.NBest[0].Words) {
    for (const phoneme of word.Phonemes) {
      const assessment = phoneme.PronunciationAssessment;
      const nBest = assessment?.NBestPhonemes;
      
      if (Array.isArray(nBest) && nBest.length > 0) {
        const intendedPhoneme = phoneme.Phoneme;
        const recognizedPhoneme = nBest[0].Phoneme;
        const accuracyScore = assessment.AccuracyScore || 0;

        // 明確なエラーペアの検出
        if (intendedPhoneme !== recognizedPhoneme) {
          errorPairs.push({
            intendedPhoneme,
            actualPhoneme: recognizedPhoneme,
          });
        } 
        // 癖の検出
        else if (accuracyScore < 85 && nBest.length > 1 && nBest[1] && nBest[1].Score && nBest[1].Score > 70) {
          habits.push({
            phoneme: intendedPhoneme,
            confusedWith: nBest[1].Phoneme,
            accuracyScore,
            lastOccurredAt: new Date(),
          });
        }
      }
    }
  }

  // 追加: 検出結果のログ出力
  console.log('updatePronunciationSummary: errorPairs =', errorPairs);
  console.log('updatePronunciationSummary: habits =', habits);

  // エラーペアの保存
  for (const pair of errorPairs) {
    try {
      await prisma.phonemeErrorSummary.upsert({
        where: {
          userId_intendedPhoneme_actualPhoneme: {
            userId,
            intendedPhoneme: pair.intendedPhoneme,
            actualPhoneme: pair.actualPhoneme,
          },
        },
        update: {
          errorCount: { increment: 1 },
          lastOccurredAt: new Date(),
        },
        create: {
          userId,
          intendedPhoneme: pair.intendedPhoneme,
          actualPhoneme: pair.actualPhoneme,
          errorCount: 1,
          lastOccurredAt: new Date(),
        },
      });
    } catch (e) {
      console.error('Prisma upsert error:', e);
      throw e;
    }
  }

  // 癖の保存
  for (const habit of habits) {
    try {
      await prisma.pronunciationHabit.upsert({
        where: {
          userId_phoneme_confusedWith: {
            userId,
            phoneme: habit.phoneme,
            confusedWith: habit.confusedWith,
          },
        },
        update: {
          accuracyScore: habit.accuracyScore,
          lastOccurredAt: new Date(),
        },
        create: {
          userId,
          phoneme: habit.phoneme,
          confusedWith: habit.confusedWith,
          accuracyScore: habit.accuracyScore,
          lastOccurredAt: new Date(),
        },
      });
    } catch (e) {
      console.error('Prisma upsert error for habit:', e);
      throw e;
    }
  }
}

export async function getPronunciationSummary(userId: string) {
  return prisma.phonemeErrorSummary.findMany({
    where: { userId },
    orderBy: [
      { errorCount: 'desc' },
      { lastOccurredAt: 'desc' },
    ],
    select: {
      intendedPhoneme: true,
      actualPhoneme: true,
      errorCount: true,
      lastOccurredAt: true,
    },
  });
} 