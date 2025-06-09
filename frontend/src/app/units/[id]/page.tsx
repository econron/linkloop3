'use client';

import { useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function UnitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  console.log('UnitPage params:', { 
    params, 
    id, 
    type: typeof id,
    rawParams: JSON.stringify(params),
    rawId: params.id,
    rawIdType: typeof params.id
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [isPausedForPractice, setIsPausedForPractice] = useState(false);

  // 録音・評価用state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    NBest?: Array<{
      PronunciationAssessment?: {
        AccuracyScore: number;
        FluencyScore: number;
      };
    }>;
    feedback?: {
      sections: Array<{
        title: string;
        content: string;
      }>;
    };
    error?: string;
    details?: string;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 仮のデータ（後でAPIから取得するように変更）
  const unitData = {
    id: id,
    title: 'RとLの発音',
    description: '英語のRとLの発音の違いを学びましょう。',
    videoUrl: '/videos/r_l_pronunciation.mp4',
    pausePoints: [31, 33, 35, 62, 64, 67],
    practiceWords: ['light', 'love', 'hello', 'right', 'read', 'friend'],
    interactivePrompts: [
      'Rの発音を練習しましょう。舌を巻いて「ル」と発音します。',
      'Lの発音を練習しましょう。舌先を上の歯茎につけて「ル」と発音します。',
    ],
  };

  // 録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioUrl(URL.createObjectURL(blob));
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // 評価API送信
  const handleSend = async () => {
    if (!audioBlob) return;
    setIsSending(true);
    setAssessmentResult(null);
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording-${unitData.practiceWords[currentPracticeIndex]}.wav`);
    formData.append('referenceText', unitData.practiceWords[currentPracticeIndex]);
    try {
      // 1. 発音評価API呼び出し
      const res = await fetch('http://localhost:4000/api/pronunciation-assessment-advanced', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('API response:', data);
      setAssessmentResult(data);

      // 2. DynamoDBに生データ保存
      try {
        await fetch("http://localhost:4000/api/pronunciation-assessment/save-raw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "test-user", // TODO: 実装時は動的に
            unitId: id,
            phrase: unitData.practiceWords[currentPracticeIndex],
            rawResult: data,
          }),
        });
      } catch (e) {
        console.error("DynamoDB保存APIエラー", e);
      }

      // 3. RDBに集計データ保存
      try {
        const unitId = Number(id);
        console.log('Current unit ID:', { 
          id, 
          unitId, 
          type: typeof unitId,
          isNaN: isNaN(unitId),
          params: params,
          rawId: params.id,
          rawIdType: typeof params.id,
          stringifiedParams: JSON.stringify(params)
        });
        
        if (isNaN(unitId)) {
          throw new Error(`Invalid unit ID: ${id}`);
        }
        
        const payload = {
          userId: "test-user", // TODO: 実装時は動的に
          unitId,
          azureResponse: data,
        };
        console.log('Saving summary with payload:', payload);
        
        const summaryRes = await fetch("http://localhost:4000/api/pronunciation-assessment/save-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!summaryRes.ok) {
          const errorData = await summaryRes.json();
          console.error('Summary save error:', errorData);
          throw new Error(`Failed to save summary: ${errorData.error}`);
        }
        
        const summaryData = await summaryRes.json();
        console.log('Summary save response:', summaryData);
        
        // 4. フィードバックを取得
        if (summaryData.analysisId) {
          setIsGeneratingFeedback(true);
          try {
            const feedbackRes = await fetch(`http://localhost:4000/api/pronunciation-assessment/${summaryData.analysisId}/feedback`);
            if (!feedbackRes.ok) {
              throw new Error(`Failed to fetch feedback: ${feedbackRes.statusText}`);
            }
            const feedbackData = await feedbackRes.json();
            setAssessmentResult(prev => ({
              ...prev,
              feedback: feedbackData.feedback
            }));
          } catch (error) {
            console.error('Error fetching feedback:', error);
            setAssessmentResult(prev => ({
              ...prev,
              error: 'Failed to generate feedback',
              details: String(error)
            }));
          } finally {
            setIsGeneratingFeedback(false);
          }
        }
      } catch (e) {
        console.error("RDB保存APIエラー", e);
      }
    } catch (err) {
      setAssessmentResult({ error: 'API request failed', details: String(err) });
    } finally {
      setIsSending(false);
    }
  };

  // 次の単語へ進む
  const handleAssessmentComplete = () => {
    setIsPausedForPractice(false);
    setCurrentPracticeIndex(idx => idx + 1);
    setAudioUrl(null);
    setAudioBlob(null);
    setAssessmentResult(null);
    setTimeout(() => {
      videoRef.current?.play();
    }, 500);
  };

  const handleTimeUpdate = () => {
    if (
      videoRef.current &&
      currentPracticeIndex < unitData.pausePoints.length &&
      videoRef.current.currentTime >= unitData.pausePoints[currentPracticeIndex]
    ) {
      videoRef.current.pause();
      setIsPausedForPractice(true);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoComplete(true);
    setIsInteractive(true);
  };

  const handleNext = () => {
    router.push(`/practice`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">{unitData.title}</h1>
        <p className="mt-2 text-sm text-black">{unitData.description}</p>
      </div>

      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        <video
          ref={videoRef}
          className="h-full w-full"
          src={unitData.videoUrl}
          controls
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />
      </div>

      {isPausedForPractice && currentPracticeIndex < unitData.practiceWords.length && (
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="text-lg font-medium text-blue-900">インタラクティブ練習</h3>
            <p className="mt-2 text-sm text-blue-700">
              練習単語: <span className="font-semibold">{unitData.practiceWords[currentPracticeIndex]}</span>
            </p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-2 rounded-full font-medium ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                disabled={isSending}
              >
                {isRecording ? '録音停止' : '録音開始'}
              </button>
            </div>
            {audioUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-black">録音音声:</h3>
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}
            {audioUrl && (
              <button
                onClick={handleSend}
                className="mt-4 px-6 py-2 rounded-full font-medium bg-green-500 hover:bg-green-600 text-white"
                disabled={isSending}
              >
                {isSending ? '送信中...' : '評価を送信'}
              </button>
            )}
            {assessmentResult && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-black">評価結果:</h3>
                <div className="bg-gray-100 p-4 rounded-lg space-y-6">
                  <div>
                    <h4 className="font-medium mb-2 text-black">スコア:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-black">正確性</p>
                        <p className="text-xl font-bold text-blue-700">{assessmentResult.NBest?.[0]?.PronunciationAssessment?.AccuracyScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-black">流暢さ</p>
                        <p className="text-xl font-bold text-blue-700">{assessmentResult.NBest?.[0]?.PronunciationAssessment?.FluencyScore}%</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-black">フィードバック:</h4>
                    <div className="space-y-2">
                      {isGeneratingFeedback ? (
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm text-gray-700">フィードバックを生成中...</p>
                        </div>
                      ) : assessmentResult?.error ? (
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm text-red-600">フィードバックの生成に失敗しました</p>
                          <p className="text-xs text-gray-500">{assessmentResult.details}</p>
                        </div>
                      ) : assessmentResult?.feedback?.sections?.length ? (
                        assessmentResult.feedback.sections.map((section: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded">
                            <h5 className="font-medium text-blue-900">{section.title}</h5>
                            <p className="text-sm text-gray-700">{section.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm text-gray-700">フィードバックはまだ生成されていません</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAssessmentComplete}
                    className="w-full px-6 py-2 rounded-full font-medium bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    次の単語へ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isVideoComplete && (
        <div className="flex justify-end">
          <Button onClick={handleNext}>次へ</Button>
        </div>
      )}
    </div>
  );
} 