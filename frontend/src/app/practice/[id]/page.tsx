'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { curriculumData } from '@/data/curriculum';
import { CompetencyStage, Competency } from '@/types/curriculum';
import confetti from 'canvas-confetti';
import { addXP, updatePhonemeScore, calculatePracticeXP, markStageCompleted, XP_REWARDS } from '@/lib/gamification';

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
  const [earnedXP, setEarnedXP] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [phonemeAnalysis, setPhonemeAnalysis] = useState<any[]>([]);
  
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

  // Analyze phoneme data from Azure response
  const analyzePhonemes = (azureResponse: any, targetPhonemes: string[]) => {
    const analysis: any[] = [];
    
    try {
      const words = azureResponse?.NBest?.[0]?.Words || [];
      
      words.forEach((word: any) => {
        const phonemes = word?.Phonemes || [];
        
        phonemes.forEach((phoneme: any) => {
          const phonemeSymbol = phoneme?.Phoneme;
          const accuracyScore = phoneme?.PronunciationAssessment?.AccuracyScore || 0;
          const nbestPhonemes = phoneme?.PronunciationAssessment?.NBestPhonemes || [];
          
          // Check if this phoneme is one of our target phonemes (l, r, etc.)
          const isTargetPhoneme = targetPhonemes.some(target => 
            target.toLowerCase().includes(phonemeSymbol?.toLowerCase()) ||
            phonemeSymbol?.toLowerCase().includes(target.toLowerCase().replace(/[\/]/g, ''))
          );
          
          if (isTargetPhoneme && accuracyScore <= 90) {
            // Get alternative phonemes that scored higher
            const alternatives = nbestPhonemes
              .filter((alt: any) => alt?.Score > accuracyScore)
              .slice(0, 3)
              .map((alt: any) => ({
                phoneme: alt?.Phoneme,
                score: alt?.Score
              }));
            
            analysis.push({
              targetPhoneme: phonemeSymbol,
              accuracyScore,
              alternatives,
              word: word?.Word,
              isLowScore: accuracyScore <= 90
            });
          }
        });
      });
    } catch (error) {
      console.error('Error analyzing phonemes:', error);
    }
    
    return analysis;
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
      
      // Analyze phonemes for detailed feedback
      if (stage?.content?.practice?.targetPhonemes) {
        const analysis = analyzePhonemes(data, stage.content.practice.targetPhonemes);
        setPhonemeAnalysis(analysis);
        
        // Update phoneme scores
        for (const phoneme of stage.content.practice.targetPhonemes) {
          updatePhonemeScore(phoneme, accuracy);
        }
        
        // Calculate and award XP
        const xpGained = calculatePracticeXP(accuracy, stage.content.practice.targetPhonemes);
        if (xpGained > 0) {
          addXP(xpGained);
          setEarnedXP(xpGained);
          setShowXPGain(true);
          
          // Hide XP gain after 3 seconds
          setTimeout(() => setShowXPGain(false), 3000);
        }
      }
      
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
      setPhonemeAnalysis([]);
    } else {
      // Practice completed
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const passed = averageScore >= stage.content.practice.passingScore;
      
      if (passed) {
        // Play success sound
        const audio = new Audio('/sound/practicedone.mp3');
        audio.play().catch(e => console.error('Success audio play failed:', e));
        
        // Award completion bonus XP
        addXP(XP_REWARDS.PRACTICE_COMPLETE);
        markStageCompleted(stage.id);
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
        {/* XP Gain Notification */}
        {showXPGain && (
          <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="font-bold">+{earnedXP} XP</span>
              {earnedXP >= XP_REWARDS.PRACTICE_SENTENCE * XP_REWARDS.BONUS_MULTIPLIER && (
                <span className="text-sm">(Bonus!)</span>
              )}
            </div>
          </div>
        )}
        
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
                  <>
                    <div className="grid grid-cols-2 gap-6 mb-6">
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

                    {/* Detailed Phoneme Feedback */}
                    {phonemeAnalysis.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                          <span className="mr-2">🎯</span>
                          Pronunciation Focus Areas
                        </h4>
                        <div className="space-y-3">
                          {phonemeAnalysis.map((analysis, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">
                                    /{analysis.targetPhoneme}/ in "{analysis.word}"
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    analysis.accuracyScore >= 70 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {analysis.accuracyScore}%
                                  </span>
                                </div>
                              </div>
                              
                              {analysis.alternatives.length > 0 && (
                                <div className="text-sm">
                                  <p className="text-gray-600 mb-1">System detected these sounds instead:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.alternatives.map((alt: any, altIndex: number) => (
                                      <span key={altIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        /{alt.phoneme}/ ({alt.score}%)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 text-xs text-orange-700">
                                💡 Focus on the correct tongue position for /{analysis.targetPhoneme}/
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {phonemeAnalysis.length === 0 && assessmentResult.NBest?.[0]?.PronunciationAssessment?.AccuracyScore >= 70 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center text-green-800">
                          <span className="text-xl mr-2">✅</span>
                          <span className="font-medium">Great pronunciation! All target phonemes sound accurate.</span>
                        </div>
                      </div>
                    )}
                  </>
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