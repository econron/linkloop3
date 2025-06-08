import { PrismaClient } from '@prisma/client';
import { AzurePronunciationResponse, PhonemeErrorPair } from '../types/pronunciation';

const prisma = new PrismaClient();

export async function updatePronunciationSummary(
  userId: string,
  azureResponse: AzurePronunciationResponse
): Promise<void> {
  // 追加: Azureレスポンスの内容をログ出力
  console.log('updatePronunciationSummary: azureResponse =', JSON.stringify(azureResponse, null, 2));
  // ステップ1: 間違い音素ペアの抽出
  const errorPairs: PhonemeErrorPair[] = [];
  
  for (const word of azureResponse.NBest[0].Words) {
    for (const phoneme of word.Phonemes) {
      const nBest = phoneme.PronunciationAssessment?.NBestPhonemes;
      if (Array.isArray(nBest) && nBest.length > 0) {
        const intendedPhoneme = phoneme.Phoneme;
        const recognizedPhoneme = nBest[0].Phoneme;
        // 本来の音素と認識された音素が異なる場合にエラーとみなす
        if (intendedPhoneme !== recognizedPhoneme) {
          errorPairs.push({
            intendedPhoneme,
            actualPhoneme: recognizedPhoneme,
          });
        }
      }
    }
  }

  // 追加: errorPairsの内容をログ出力
  console.log('updatePronunciationSummary: errorPairs =', errorPairs);

  // ステップ2: データベースの更新 (UPSERT)
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