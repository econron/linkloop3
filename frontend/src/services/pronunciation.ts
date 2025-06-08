import { FeedbackResponse, PronunciationAnalysis } from '../types/pronunciation';

export async function getPronunciationFeedback(
  analysisId: number,
  options?: {
    focusOn?: string[];
    includeGeneralAdvice?: boolean;
  }
): Promise<FeedbackResponse> {
  const params = new URLSearchParams();
  if (options?.focusOn) {
    params.append('focusOn', options.focusOn.join(','));
  }
  if (options?.includeGeneralAdvice !== undefined) {
    params.append('includeGeneralAdvice', options.includeGeneralAdvice.toString());
  }

  const response = await fetch(
    `http://localhost:3001/api/pronunciation-assessment/${analysisId}/feedback?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }
  return response.json();
}

export async function analyzePronunciation(
  audioBlob: Blob,
  referenceText: string,
  userId?: string
): Promise<{ analysisId: number; azureResponse: any }> {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('referenceText', referenceText);

  const headers: HeadersInit = {};
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch('http://localhost:3001/api/pronunciation-assessment-advanced', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze pronunciation');
  }

  return response.json();
} 