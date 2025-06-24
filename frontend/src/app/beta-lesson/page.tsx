'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LessonStep {
  id: number;
  title: string;
  content: string;
  duration: number; // in seconds
  audioFiles?: string[];
  actionType?: 'listen' | 'practice' | 'compare';
  nextButtonText: string;
}

const lessonSteps: LessonStep[] = [
  {
    id: 1,
    title: '問題提起',
    content: 'redとledを聞いてください。区別できますか？',
    duration: 30,
    audioFiles: ['/sound/output_audio/red_r.mp3', '/sound/output_audio/led_l.mp3'],
    actionType: 'listen',
    nextButtonText: '聞こえた！次へ'
  },
  {
    id: 2,
    title: '第一の気づき',
    content: 'rは巻き舌っぽく聞こえませんか？\n\nユーザーが既知の概念で理解しようとする段階です。多くの日本人学習者は、英語の「r」を巻き舌で発音しようとします。',
    duration: 30,
    audioFiles: ['/sound/output_audio/red_r.mp3'],
    actionType: 'listen',
    nextButtonText: 'なるほど、次へ'
  },
  {
    id: 3,
    title: '第二の気づき（より深い理解）',
    content: 'でも実は、舌先はどこにも触れていないんです。\n\n巻き舌は舌先を震わせますが、英語のrは舌全体を喉の奥に引くだけ。似ているけど、全く違う動きなんです。',
    duration: 15,
    nextButtonText: '理解した！実践してみる'
  },
  {
    id: 4,
    title: '実践と体感',
    content: '正しい舌の動きでrを発音してみましょう。\n\n舌全体を喉の奥に引いて「r」を発音してください。巻き舌よりも楽で、でもちゃんとrに聞こえます！',
    duration: 30,
    actionType: 'practice',
    nextButtonText: '発音できた！次へ'
  },
  {
    id: 5,
    title: '達成感',
    content: 'redとledの聞き分けと発音に再チャレンジ！\n\n理解が深まると、こんなに変わるんですね。最初の音声と比べてみてください。\n\n今度はクイズで実力を試してみましょう！',
    duration: 15,
    audioFiles: ['/sound/output_audio/red_r.mp3', '/sound/output_audio/led_l.mp3'],
    actionType: 'compare',
    nextButtonText: 'R/Lクイズに挑戦！'
  }
];

export default function BetaLessonPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(lessonSteps[0].duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [playedAudios, setPlayedAudios] = useState<number[]>([]);

  const currentLessonStep = lessonSteps[currentStep];

  useEffect(() => {
    if (!lessonStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setTotalElapsed(prev => prev + 1);
          return lessonSteps[currentStep]?.duration || 0;
        }
        return prev - 1;
      });
      setTotalElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [lessonStarted, currentStep]);

  const startLesson = () => {
    setLessonStarted(true);
    setCurrentStep(0);
    setTimeRemaining(lessonSteps[0].duration);
    setTotalElapsed(0);
  };

  const nextStep = () => {
    if (currentStep < lessonSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setTimeRemaining(lessonSteps[nextStepIndex].duration);
      setPlayedAudios([]); // Reset played audios for new step
    } else {
      // Lesson completed - redirect to R/L quiz
      router.push('/quiz/SEG-LIQUID-LR-007-2');
    }
  };

  const playAudio = (audioPath: string, audioIndex: number) => {
    setIsPlaying(true);
    const audio = new Audio(audioPath);
    audio.onended = () => {
      setIsPlaying(false);
      setPlayedAudios(prev => [...prev, audioIndex]);
    };
    audio.play().catch(e => {
      console.error('Audio play failed:', e);
      setIsPlaying(false);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!lessonStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-4">
            BETA LESSON
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            2分間R/L体験レッスン
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            redとledの違いを2分間で完全に理解できる特別なレッスンです。<br/>
            日本人が陥りがちな「巻き舌」の誤解を解き、正しい発音方法を学びましょう。
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-blue-800 mb-2">レッスン構成（2分間）</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>📢 0-30秒: 問題提起（聞き分けチャレンジ）</div>
              <div>💡 30秒-1分: 第一の気づき（巻き舌っぽい？）</div>
              <div>🧠 1分-1分15秒: 第二の気づき（実は全然違う！）</div>
              <div>🗣️ 1分15秒-1分45秒: 実践と体感</div>
              <div>🎉 1分45秒-2分: 達成感（再チャレンジ）</div>
            </div>
          </div>

          <button
            onClick={startLesson}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
          >
            ベータレッスンを開始
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                BETA
              </div>
              <h1 className="text-xl font-bold text-gray-800">2分間R/L体験レッスン</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">経過時間</div>
              <div className="text-lg font-bold text-purple-600">{formatTime(totalElapsed)}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / lessonSteps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Step {currentStep + 1} / {lessonSteps.length}</span>
            <span>{currentLessonStep.title}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentLessonStep.title}
            </h2>
            <div className="text-lg text-gray-700 whitespace-pre-line leading-relaxed">
              {currentLessonStep.content}
            </div>
          </div>

          {/* Action Section */}
          {currentLessonStep.actionType === 'listen' && currentLessonStep.audioFiles && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                音声を聞いてみましょう
              </h3>
              <div className="flex justify-center gap-4">
                {currentLessonStep.audioFiles.map((audio, index) => {
                  const isButtonEnabled = index === 0 || playedAudios.includes(index - 1);
                  const hasBeenPlayed = playedAudios.includes(index);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => playAudio(audio, index)}
                      disabled={isPlaying || !isButtonEnabled}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        !isButtonEnabled 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : hasBeenPlayed
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : isPlaying && isButtonEnabled
                              ? 'bg-blue-400 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {hasBeenPlayed ? '✅' : '🔊'} {index === 0 ? 'red' : 'led'} を聞く
                    </button>
                  );
                })}
              </div>
              {currentLessonStep.audioFiles.length > 1 && playedAudios.length === 0 && (
                <p className="text-center text-blue-600 text-sm mt-3">
                  最初に "red" を聞いてから "led" が聞けるようになります
                </p>
              )}
            </div>
          )}

          {currentLessonStep.actionType === 'practice' && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
                発音練習
              </h3>
              <div className="text-center">
                <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4 inline-block">
                  <div className="text-2xl font-bold text-green-700">R</div>
                  <div className="text-sm text-green-600">舌全体を喉の奥に引く</div>
                </div>
                <p className="text-green-700 mb-4">
                  舌先をどこにも触れさせず、舌全体をゆっくり後ろに引いてみてください
                </p>
              </div>
            </div>
          )}

          {currentLessonStep.actionType === 'compare' && currentLessonStep.audioFiles && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 text-center">
                最終チャレンジ
              </h3>
              <div className="flex justify-center gap-4 mb-4">
                {currentLessonStep.audioFiles.map((audio, index) => {
                  const isButtonEnabled = index === 0 || playedAudios.includes(index - 1);
                  const hasBeenPlayed = playedAudios.includes(index);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => playAudio(audio, index)}
                      disabled={isPlaying || !isButtonEnabled}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        !isButtonEnabled 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : hasBeenPlayed
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : isPlaying && isButtonEnabled
                              ? 'bg-yellow-400 text-white'
                              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }`}
                    >
                      {hasBeenPlayed ? '✅' : '🔊'} {index === 0 ? 'red' : 'led'}
                    </button>
                  );
                })}
              </div>
              {currentLessonStep.audioFiles.length > 1 && playedAudios.length === 0 && (
                <p className="text-center text-yellow-600 text-sm mb-3">
                  最初に "red" を聞いてから "led" が聞けるようになります
                </p>
              )}
              <p className="text-center text-yellow-700">
                最初と比べて、違いがはっきり分かるようになりましたか？
              </p>
            </div>
          )}

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={nextStep}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
            >
              {currentLessonStep.nextButtonText}
            </button>
          </div>

          {/* Step Timer */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500">このステップの残り時間</div>
            <div className="text-xl font-bold text-purple-600">{formatTime(timeRemaining)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}