'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface QuizPair {
  rWord: string;
  lWord: string;
  rAudio: string;
  lAudio: string;
}

const quizData: QuizPair[] = [
  { rWord: 'red', lWord: 'led', rAudio: '/sound/output_audio/red_r.mp3', lAudio: '/sound/output_audio/led_l.mp3' },
  { rWord: 'rice', lWord: 'lice', rAudio: '/sound/output_audio/rice_r.mp3', lAudio: '/sound/output_audio/lice_l.mp3' },
  { rWord: 'road', lWord: 'load', rAudio: '/sound/output_audio/road_r.mp3', lAudio: '/sound/output_audio/load_l.mp3' },
  { rWord: 'rock', lWord: 'lock', rAudio: '/sound/output_audio/rock_r.mp3', lAudio: '/sound/output_audio/lock_l.mp3' },
  { rWord: 'race', lWord: 'lace', rAudio: '/sound/output_audio/race_r.mp3', lAudio: '/sound/output_audio/lace_l.mp3' },
  { rWord: 'rent', lWord: 'lent', rAudio: '/sound/output_audio/rent_r.mp3', lAudio: '/sound/output_audio/lent_l.mp3' },
  { rWord: 'row', lWord: 'low', rAudio: '/sound/output_audio/row_r.mp3', lAudio: '/sound/output_audio/low_l.mp3' },
  { rWord: 'rake', lWord: 'lake', rAudio: '/sound/output_audio/rake_r.mp3', lAudio: '/sound/output_audio/lake_l.mp3' },
  { rWord: 'read', lWord: 'lead', rAudio: '/sound/output_audio/read_r.mp3', lAudio: '/sound/output_audio/lead_l.mp3' },
];

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [questionAudio, setQuestionAudio] = useState<string>('');
  const router = useRouter();

  const currentPair = quizData[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.length - 1;

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestionIndex]);

  const startNewQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    // Randomly choose R or L word
    const isRWord = Math.random() < 0.5;
    const selectedWord = isRWord ? currentPair.rWord : currentPair.lWord;
    const selectedAudio = isRWord ? currentPair.rAudio : currentPair.lAudio;
    
    setCorrectAnswer(selectedWord);
    setQuestionAudio(selectedAudio);
    
    // Auto-play the question audio
    setTimeout(() => {
      playAudio(selectedAudio);
    }, 500);
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
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    setShowFeedback(true);
    
    if (selectedAnswer === correctAnswer) {
      playSuccessSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      router.push('/practice');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              R/L Discrimination Quiz
            </h1>
            <div className="text-lg text-gray-600">
              Question {currentQuestionIndex + 1} of {quizData.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
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
              {[currentPair.rWord, currentPair.lWord].map((word) => (
                <div key={word} className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAnswerSelect(word)}
                    disabled={showFeedback}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === word
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${showFeedback ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span className="text-lg font-medium">{word}</span>
                  </button>
                  <button
                    onClick={() => playAudio(word === currentPair.rWord ? currentPair.rAudio : currentPair.lAudio)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                  >
                    🔊 Listen
                  </button>
                </div>
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
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">❌ Incorrect</h3>
                    <p>The correct answer was "{correctAnswer}".</p>
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