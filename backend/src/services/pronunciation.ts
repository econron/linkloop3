import { PrismaClient } from '@prisma/client';
import { AzurePronunciationResponse, PhonemeErrorPair, PronunciationHabit } from '../types/pronunciation';

const prisma = new PrismaClient();

interface AnalysisData {
  errorPairs: PhonemeErrorPair[];
  habits: PronunciationHabit[];
}

function extractFindings(azureResponse: AzurePronunciationResponse): AnalysisData {
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

  return { errorPairs, habits };
}

export async function analyzeAndSavePronunciation(
  userId: string,
  unitId: number,
  azureResponse: AzurePronunciationResponse
): Promise<number> {
  const analysisData = extractFindings(azureResponse);

  const newAnalysis = await prisma.$transaction(async (tx) => {
    // 分析レコードの作成
    const analysis = await tx.pronunciationAnalysis.create({
      data: {
        userId,
        unitId,
        overallScore: azureResponse.NBest[0].PronunciationAssessment.PronScore || 0,
        accuracyScore: azureResponse.NBest[0].PronunciationAssessment.AccuracyScore || 0,
        fluencyScore: azureResponse.NBest[0].PronunciationAssessment.FluencyScore || 0,
        prosodyScore: azureResponse.NBest[0].PronunciationAssessment.ProsodyScore || 0,
      },
    });

    // エラーペアの保存
    for (const pair of analysisData.errorPairs) {
      await tx.pronunciationFinding.create({
        data: {
          analysisId: analysis.id,
          type: 'ERROR',
          phoneme: pair.intendedPhoneme,
          details: JSON.stringify({ actual: pair.actualPhoneme }),
        },
      });
    }

    // 癖の保存
    for (const habit of analysisData.habits) {
      await tx.pronunciationFinding.create({
        data: {
          analysisId: analysis.id,
          type: 'HABIT',
          phoneme: habit.phoneme,
          details: JSON.stringify({
            confusedWith: habit.confusedWith,
            accuracyScore: habit.accuracyScore,
          }),
        },
      });
    }

    return analysis;
  });

  return newAnalysis.id;
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