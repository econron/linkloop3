'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { curriculumData } from '@/data/curriculum';
import { CompetencyStage, Competency } from '@/types/curriculum';
import confetti from 'canvas-confetti';

export default function PracticeStagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [stage, setStage] = useState<CompetencyStage | null>(null);
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // カリキュラムデータから該当ステージを見つける
    for (const comp of curriculumData.competencies) {
      const foundStage = comp.stages.find(s => s.id === id);
      if (foundStage) {
        setStage(foundStage);
        setCompetency(comp);
        break;
      }
    }
  }, [id]);

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
    if (!audioBlob || !stage?.content?.practice?.sentences) return;
    
    setIsSending(true);
    setAssessmentResult(null);
    
    const currentSentence = stage.content.practice.sentences[currentSentenceIndex];
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording-${currentSentenceIndex}.wav`);
    formData.append('referenceText', currentSentence.text);
    
    try {
      const res = await fetch('http://localhost:4000/api/pronunciation-assessment-advanced', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setAssessmentResult(data);
      
      // Store the score
      const accuracy = data.NBest?.[0]?.PronunciationAssessment?.AccuracyScore || 0;
      setScores(prev => [...prev, accuracy]);
      
      // Play success sound and confetti if the score is good (70+ points)
      if (accuracy >= 70) {
        const audio = new Audio('/sound/practicedone.mp3');
        audio.play().catch(e => console.error('Success audio play failed:', e));
        
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
    } catch (err) {
      setAssessmentResult({ error: 'API request failed', details: String(err) });
    } finally {
      setIsSending(false);
    }
  };

  const handleNext = () => {
    if (!stage?.content?.practice?.sentences) return;
    
    if (currentSentenceIndex < stage.content.practice.sentences.length - 1) {
      // Next sentence
      setCurrentSentenceIndex(prev => prev + 1);
      setAudioUrl(null);
      setAudioBlob(null);
      setAssessmentResult(null);
    } else {
      // Practice completed
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const passed = averageScore >= stage.content.practice.passingScore;
      
      if (passed) {
        // Play success sound
        const audio = new Audio('/sound/practicedone.mp3');
        audio.play().catch(e => console.error('Success audio play failed:', e));
      }
      
      // Return to home
      router.push('/');
    }
  };

  if (!stage || !competency) {
    return <div>Loading...</div>;
  }

  if (stage.type !== 'production' || !stage.content?.practice) {
    return <div>This page is only for production (practice) stages</div>;
  }

  const currentSentence = stage.content.practice.sentences[currentSentenceIndex];
  const isLastSentence = currentSentenceIndex === stage.content.practice.sentences.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {competency.title} - {stage.title}
            </h1>
            <div className="text-lg text-gray-600">
              Sentence {currentSentenceIndex + 1} of {stage.content.practice.sentences.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSentenceIndex + 1) / stage.content.practice.sentences.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Practice Sentence</h2>
            <p className="text-2xl text-center font-medium text-gray-800 leading-relaxed">
              "{currentSentence.text}"
            </p>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Target words:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {currentSentence.targetWords.map((word, index) => (
                  <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-8 py-4 rounded-full font-medium text-lg ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                disabled={isSending}
              >
                {isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
              </button>
            </div>

            {audioUrl && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Your Recording:</h3>
                <audio controls src={audioUrl} className="w-full mb-4" />
                <button
                  onClick={handleSend}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                  disabled={isSending}
                >
                  {isSending ? 'Analyzing...' : 'Get Pronunciation Assessment'}
                </button>
              </div>
            )}

            {assessmentResult && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Assessment Result:</h3>
                {assessmentResult.error ? (
                  <div className="text-red-600">
                    <p>Error: {assessmentResult.error}</p>
                    <p className="text-sm">{assessmentResult.details}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {assessmentResult.NBest?.[0]?.PronunciationAssessment?.AccuracyScore || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Fluency</p>
                      <p className="text-3xl font-bold text-green-600">
                        {assessmentResult.NBest?.[0]?.PronunciationAssessment?.FluencyScore || 0}%
                      </p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleNext}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium"
                >
                  {isLastSentence ? 'Finish Practice' : 'Next Sentence'}
                </button>
              </div>
            )}
          </div>

          {scores.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mt-8">
              <h3 className="text-lg font-semibold mb-2">Progress</h3>
              <p className="text-sm text-gray-600">
                Average Score: {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}% 
                (Target: {stage.content.practice.passingScore}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}