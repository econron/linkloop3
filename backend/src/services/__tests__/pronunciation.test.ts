import { PrismaClient } from '@prisma/client';
import { updatePronunciationSummary, getPronunciationSummary } from '../pronunciation';
import { AzurePronunciationResponse } from '../../types/pronunciation';

// PrismaClientのモック
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    phonemeErrorSummary: {
      upsert: jest.fn().mockImplementation(() => Promise.resolve()),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('Pronunciation Service', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('updatePronunciationSummary', () => {
    const mockUserId = 'test-user-id';
    const mockAzureResponse: AzurePronunciationResponse = {
      NBest: [{
        Words: [
          {
            Word: 'test',
            Phonemes: [
              {
                Phoneme: 'r',
                PronunciationAssessment: {
                  ErrorType: 'None',
                  NBestPhonemes: [{ Phoneme: 'l' }],
                },
              },
              {
                Phoneme: 'e',
                PronunciationAssessment: {
                  ErrorType: 'None',
                  NBestPhonemes: [{ Phoneme: 'e' }],
                },
              },
            ],
          },
        ],
      }],
    };

    it('should update error summary for phonemes where intended and recognized phoneme differ', async () => {
      await updatePronunciationSummary(mockUserId, mockAzureResponse);

      expect(prisma.phonemeErrorSummary.upsert).toHaveBeenCalledWith({
        where: {
          userId_intendedPhoneme_actualPhoneme: {
            userId: mockUserId,
            intendedPhoneme: 'r',
            actualPhoneme: 'l',
          },
        },
        update: {
          errorCount: { increment: 1 },
          lastOccurredAt: expect.any(Date),
        },
        create: {
          userId: mockUserId,
          intendedPhoneme: 'r',
          actualPhoneme: 'l',
          errorCount: 1,
          lastOccurredAt: expect.any(Date),
        },
      });
    });

    it('should not update for correctly recognized phonemes', async () => {
      const responseWithoutErrors: AzurePronunciationResponse = {
        NBest: [{
          Words: [
            {
              Word: 'test',
              Phonemes: [
                {
                  Phoneme: 'e',
                  PronunciationAssessment: {
                    ErrorType: 'None',
                    NBestPhonemes: [{ Phoneme: 'e' }],
                  },
                },
              ],
            },
          ],
        }],
      };

      await updatePronunciationSummary(mockUserId, responseWithoutErrors);

      expect(prisma.phonemeErrorSummary.upsert).not.toHaveBeenCalled();
    });

    it('should handle missing NBestPhonemes', async () => {
      const responseWithMissingNBest: AzurePronunciationResponse = {
        NBest: [{
          Words: [
            {
              Word: 'test',
              Phonemes: [
                {
                  Phoneme: 'r',
                  PronunciationAssessment: {
                    ErrorType: 'None',
                    NBestPhonemes: [],
                  },
                },
              ],
            },
          ],
        }],
      };

      await updatePronunciationSummary(mockUserId, responseWithMissingNBest);

      expect(prisma.phonemeErrorSummary.upsert).not.toHaveBeenCalled();
    });

    it('should update error summary for multiple error pairs', async () => {
      const responseWithMultipleErrors: AzurePronunciationResponse = {
        NBest: [{
          Words: [
            {
              Word: 'test',
              Phonemes: [
                {
                  Phoneme: 'r',
                  PronunciationAssessment: {
                    ErrorType: 'None',
                    NBestPhonemes: [{ Phoneme: 'l' }],
                  },
                },
                {
                  Phoneme: 't',
                  PronunciationAssessment: {
                    ErrorType: 'None',
                    NBestPhonemes: [{ Phoneme: 'd' }],
                  },
                },
              ],
            },
          ],
        }],
      };

      await updatePronunciationSummary(mockUserId, responseWithMultipleErrors);

      expect(prisma.phonemeErrorSummary.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.phonemeErrorSummary.upsert).toHaveBeenCalledWith({
        where: {
          userId_intendedPhoneme_actualPhoneme: {
            userId: mockUserId,
            intendedPhoneme: 'r',
            actualPhoneme: 'l',
          },
        },
        update: expect.any(Object),
        create: expect.objectContaining({
          userId: mockUserId,
          intendedPhoneme: 'r',
          actualPhoneme: 'l',
        }),
      });
      expect(prisma.phonemeErrorSummary.upsert).toHaveBeenCalledWith({
        where: {
          userId_intendedPhoneme_actualPhoneme: {
            userId: mockUserId,
            intendedPhoneme: 't',
            actualPhoneme: 'd',
          },
        },
        update: expect.any(Object),
        create: expect.objectContaining({
          userId: mockUserId,
          intendedPhoneme: 't',
          actualPhoneme: 'd',
        }),
      });
    });
  });

  describe('getPronunciationSummary', () => {
    const mockUserId = 'test-user-id';
    const mockSummary = [
      {
        intendedPhoneme: 'r',
        actualPhoneme: 'l',
        errorCount: 5,
        lastOccurredAt: new Date(),
      },
    ];

    it('should return pronunciation summary ordered by error count', async () => {
      (prisma.phonemeErrorSummary.findMany as jest.Mock).mockResolvedValueOnce(mockSummary);

      const result = await getPronunciationSummary(mockUserId);

      expect(prisma.phonemeErrorSummary.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
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
      expect(result).toEqual(mockSummary);
    });
  });
}); 