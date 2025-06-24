'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { curriculumData } from '@/data/curriculum';
import { CompetencyStage, Competency } from '@/types/curriculum';
import confetti from 'canvas-confetti';
import { addXP, calculateQuizXP, markStageCompleted, XP_REWARDS } from '@/lib/gamification';

export default function QuizStagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [stage, setStage] = useState<CompetencyStage | null>(null);
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [questionAudio, setQuestionAudio] = useState<string>('');
  const [score, setScore] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [showSadEffect, setShowSadEffect] = useState(false);
  const [showSadPopup, setShowSadPopup] = useState(false);

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

  useEffect(() => {
    if (stage?.content?.quiz?.questions && stage.content.quiz.questions.length > 0) {
      startNewQuestion();
    }
  }, [currentQuestionIndex, stage]);

  const startNewQuestion = () => {
    if (!stage?.content?.quiz?.questions) return;
    
    const currentQuestion = stage.content.quiz.questions[currentQuestionIndex];
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    // Randomly choose which word to play
    const isWord1 = Math.random() < 0.5;
    const selectedWord = isWord1 ? currentQuestion.word1 : currentQuestion.word2;
    const selectedAudio = isWord1 ? currentQuestion.audio1 : currentQuestion.audio2;
    
    setCorrectAnswer(selectedWord);
    if (selectedAudio) {
      setQuestionAudio(selectedAudio);
      
      // Auto-play the question audio
      setTimeout(() => {
        playAudio(selectedAudio);
      }, 500);
    }
  };

  const playAudio = (audioPath: string) => {
    const audio = new Audio(audioPath);
    audio.play().catch(e => console.error('Audio play failed:', e));
  };

  const playSuccessSound = () => {
    const audio = new Audio('/sound/practicedone.mp3');
    audio.play().catch(e => console.error('Success audio play failed:', e));
  };


  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    
    // Play the audio for the selected word
    if (!stage?.content?.quiz?.questions) return;
    const currentQuestion = stage.content.quiz.questions[currentQuestionIndex];
    const audioPath = answer === currentQuestion.word1 ? currentQuestion.audio1 : currentQuestion.audio2;
    if (audioPath) {
      playAudio(audioPath);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !stage?.content?.quiz) return;
    
    setShowFeedback(true);
    
    if (selectedAnswer === correctAnswer) {
      setScore(prev => prev + 1);
      
      // Award XP for correct answer
      addXP(XP_REWARDS.QUIZ_CORRECT);
      setShowXPGain(true);
      setTimeout(() => setShowXPGain(false), 2000);
      
      playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      // Show sad effect for incorrect answer
      setShowSadEffect(true);
      setShowSadPopup(true);
      
      // Hide effects after timers
      setTimeout(() => setShowSadEffect(false), 2000);
      setTimeout(() => setShowSadPopup(false), 1500);
    }
  };

  const handleNext = () => {
    if (!stage?.content?.quiz?.questions) return;
    
    if (currentQuestionIndex < stage.content.quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed
      const finalScore = (score / stage.content.quiz.questions.length) * 100;
      const passed = finalScore >= stage.content.quiz.passingScore;
      
      // Award completion XP
      const completionXP = calculateQuizXP(score, stage.content.quiz.questions.length);
      addXP(completionXP);
      
      if (passed && stage && competency) {
        markStageCompleted(stage.id);
        
        // Move to next stage
        const currentStageIndex = competency.stages.findIndex(s => s.id === stage.id);
        if (currentStageIndex < competency.stages.length - 1) {
          const nextStage = competency.stages[currentStageIndex + 1];
          if (nextStage.type === 'production') {
            router.push(`/practice/${nextStage.id}`);
          } else if (nextStage.type === 'lecture') {
            router.push(`/units/${nextStage.id}`);
          }
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    }
  };

  if (!stage || !competency) {
    return <div>Loading...</div>;
  }

  if (stage.type !== 'perception' || !stage.content?.quiz) {
    return <div>This page is only for perception (quiz) stages</div>;
  }

  const currentQuestion = stage.content.quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === stage.content.quiz.questions.length - 1;
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* XP Gain Notification */}
        {showXPGain && (
          <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="font-bold">+{XP_REWARDS.QUIZ_CORRECT} XP</span>
            </div>
          </div>
        )}
        
        {/* Sad Effect Notification */}
        {showSadEffect && (
          <div className="fixed top-4 left-4 bg-red-100 text-red-800 px-6 py-3 rounded-lg shadow-lg animate-pulse z-50">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🥺</span>
              <span className="font-medium">もう一度頑張って！</span>
            </div>
          </div>
        )}

        {/* Large Sad Popup */}
        {showSadPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="animate-ping">
              <div className="text-9xl animate-bounce" style={{
                animation: 'sadPopup 1.5s ease-out forwards',
                filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
              }}>
                🥺
              </div>
            </div>
          </div>
        )}

        {/* Add custom CSS for the sad popup animation */}
        <style jsx>{`
          @keyframes sadPopup {
            0% {
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 0.8;
            }
          }
        `}</style>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {competency.title} - {stage.title}
            </h1>
            <div className="text-lg text-gray-600">
              Question {currentQuestionIndex + 1} of {stage.content.quiz.questions.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / stage.content.quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-xl mb-6">Listen and choose which word you heard:</p>
            
            <button
              onClick={() => playAudio(questionAudio)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium mb-8 transition-colors"
            >
              🔊 Play Again
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[currentQuestion.word1, currentQuestion.word2].map((word) => (
                <button
                  key={word}
                  onClick={() => handleAnswerSelect(word)}
                  disabled={showFeedback}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedAnswer === word
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${showFeedback ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-medium">{word}</span>
                    <span className="text-sm text-gray-500">🔊</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Click to select & listen</div>
                </button>
              ))}
            </div>

            {!showFeedback && selectedAnswer && (
              <button
                onClick={handleSubmitAnswer}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Submit Answer
              </button>
            )}

            {showFeedback && (
              <div className="mt-6">
                {isCorrect ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">🎉 Correct!</h3>
                    <p>Well done! You heard "{correctAnswer}" correctly.</p>
                    <p className="text-sm mt-2">Score: {score}/{currentQuestionIndex + 1}</p>
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">❌ Incorrect</h3>
                    <p>The correct answer was "{correctAnswer}".</p>
                    <p className="text-sm mt-2">Score: {score}/{currentQuestionIndex + 1}</p>
                  </div>
                )}
                
                <button
                  onClick={handleNext}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}