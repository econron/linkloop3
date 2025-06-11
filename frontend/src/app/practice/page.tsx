"use client";
import React from "react";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postXpHistory, postQuestProgress } from '../../lib/api';

const lessonConfigs: Record<string, { phonemes: string[]; phrases: string[] }> = {
  'rl': {
    phonemes: ['r', 'l'],
    phrases: [
      'Really lucky rabbit.',
      'Roll the red ball.',
      'Light and right.',
    ]
  },
  'th': {
    phonemes: ['θ', 'ð'],
    phrases: [
      'Think about it carefully.',
      'This is the best thing.',
      'Thank you for everything.'
    ]
  },
  'vf': {
    phonemes: ['v', 'f'],
    phrases: [
      'Very funny video.',
      'Five vivid flowers.',
      'Voice and face.'
    ]
  }
};

const USER_ID = 'test-user'; // TODO: 実装時は動的に

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawLessonKey = searchParams.get('lesson');
  const lessonKeys = Object.keys(lessonConfigs);
  const lessonKey = (rawLessonKey && lessonKeys.includes(rawLessonKey)) ? rawLessonKey : 'th';
  const lesson = lessonConfigs[lessonKey] || lessonConfigs['th'];
  const lessonPhonemes = lesson.phonemes;
  const practicePhrases = lesson.phrases;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isLoadingAiFeedback, setIsLoadingAiFeedback] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [aiFeedbackSections, setAiFeedbackSections] = useState<any[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [fever, setFever] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const [xpAnimKey, setXpAnimKey] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0);
  const [bonusBreakdown, setBonusBreakdown] = useState<{ base: number; combo: number; fever: number }>({ base: 0, combo: 0, fever: 0 });
  const [feverMsg, setFeverMsg] = useState('');

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
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setAudioUrl(URL.createObjectURL(blob));
        setAudioBlob(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("マイクの利用に失敗しました");
    }
  };

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  // API送信
  const handleSend = async () => {
    if (!audioBlob) return;
    setIsSending(true);
    setAssessmentResult(null);
    setFeedback(null);
    setError(null);
    setIsGeneratingFeedback(true);
    
    const formData = new FormData();
    formData.append("audio", audioBlob, `recording-${practicePhrases[currentIndex]}.wav`);
    formData.append("referenceText", practicePhrases[currentIndex]);
    
    try {
      // 1. 発音評価API呼び出し
      console.log('Sending assessment request...');
      const res = await fetch("http://localhost:4000/api/pronunciation-assessment-advanced", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`API request failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Received assessment result:', data);
      setAssessmentResult(data);
      
      // PronScoreまたはAccuracyScoreでフィードバック
      const pronScore = data?.NBest?.[0]?.PronunciationAssessment?.PronScore ?? 0;
      // accuracy score & phoneme抽出
      const phonemeResults: { phoneme: string; accuracy: number }[] = [];
      const words = data?.NBest?.[0]?.Words ?? [];
      words.forEach((word: any) => {
        (word.Phonemes ?? []).forEach((p: any) => {
          phonemeResults.push({ phoneme: p.Phoneme, accuracy: p.PronunciationAssessment?.AccuracyScore ?? 0 });
        });
      });
      // 対象発音記号で高精度
      const hitTarget = phonemeResults.some(
        p => lessonPhonemes.includes(p.phoneme) && p.accuracy >= 90
      );
      // それ以外で高精度
      const hitOther = phonemeResults.some(
        p => !lessonPhonemes.includes(p.phoneme) && p.accuracy >= 90
      );
      let xpMultiplier = 1;
      let feverMsg = '';
      if (hitTarget) {
        xpMultiplier = 2;
        feverMsg = 'レッスン対象発音でフィーバー！XP2倍！';
      } else if (hitOther) {
        xpMultiplier = 0.5;
        feverMsg = '高精度発音で+0.5倍ボーナス！';
      }
      const baseXp = Math.round(pronScore);
      const gainedXp = Math.round(baseXp * xpMultiplier);
      setXpGain(gainedXp);
      setXpAnimKey(prev => prev + 1); // アニメーション用
      // ボーナス計算
      const comboBonus = combo > 0 ? combo * 2 : 0;
      const feverBonus = fever ? Math.round(gainedXp * 0.5) : 0;
      setBonusBreakdown(prev => ({
        base: prev.base + gainedXp,
        combo: prev.combo + comboBonus,
        fever: prev.fever + feverBonus,
      }));
      setSessionXp(prev => prev + gainedXp + comboBonus + feverBonus);
      setSessionMaxCombo(prev => Math.max(prev, combo));
      // コンボ・フィーバー管理
      if (pronScore >= 70) {
        setCombo(prev => {
          const next = prev + 1;
          setMaxCombo(m => Math.max(m, next));
          if (next > 0 && next % 5 === 0) setFever(true);
          return next;
        });
      } else {
        setCombo(0);
        setFever(false);
      }
      // XP加算API
      try {
        await postXpHistory(USER_ID, gainedXp, fever ? 'fever' : 'practice');
      } catch (e) { /* エラー握りつぶし */ }
      // クエスト進捗API（例: quest-practice）
      try {
        await postQuestProgress(USER_ID, 'quest-practice', 1);
      } catch (e) { /* エラー握りつぶし */ }
      // フィードバック
      let feedbackMessage = "Nice!";
      if (pronScore >= 90) {
        feedbackMessage = "Super!";
      } else if (pronScore >= 70) {
        feedbackMessage = "Good!";
      }
      console.log('Setting feedback message:', feedbackMessage);
      setFeedback(feedbackMessage);
      setFeverMsg(feverMsg); // UI用

      // 2. DynamoDBに生データ保存
      try {
        console.log('Saving raw data to DynamoDB...');
        const rawRes = await fetch("http://localhost:4000/api/pronunciation-assessment/save-raw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "test-user", // TODO: 実装時は動的に
            unitId: "unit-1",    // TODO: 実装時は動的に
            phrase: practicePhrases[currentIndex],
            rawResult: data,
          }),
        });
        
        if (!rawRes.ok) {
          console.error("DynamoDB保存APIエラー", await rawRes.text());
        } else {
          console.log('Raw data saved successfully');
        }
      } catch (e) {
        console.error("DynamoDB保存APIエラー", e);
      }

      // 3. RDBにミス発音組み合わせを保存
      try {
        console.log('Saving summary to RDB...');
        const summaryRes = await fetch("http://localhost:4000/api/pronunciation-assessment/save-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "test-user", // TODO: 実装時は動的に
            unitId: 1, // TODO: 実装時は動的に
            azureResponse: data,
          }),
        });
        
        if (!summaryRes.ok) {
          console.error("RDB保存APIエラー", await summaryRes.text());
        } else {
          console.log('Summary saved successfully');
          const summaryData = await summaryRes.json();
          console.log('summaryData:', summaryData);
          if (summaryData.analysisId) {
            setIsLoadingAiFeedback(true);
            setAiFeedbackError(null);
            try {
              console.log('Fetching AI feedback...');
              const feedbackRes = await fetch(`http://localhost:4000/api/pronunciation-assessment/${summaryData.analysisId}/feedback`);
              console.log('AI feedback response status:', feedbackRes.status);
              if (!feedbackRes.ok) {
                throw new Error(`Failed to fetch feedback: ${feedbackRes.statusText}`);
              }
              const feedbackData = await feedbackRes.json();
              console.log('AI feedback data:', feedbackData);
              // フィードバック文をそのままstateに格納
              setAiFeedback(feedbackData.feedback);
              setAiFeedbackSections(feedbackData.feedback?.sections || []);
            } catch (error) {
              console.error('AI feedback fetch error:', error);
              setAiFeedbackError('AIフィードバックの取得に失敗しました');
              setAiFeedback(null);
              setAiFeedbackSections([]);
            } finally {
              setIsLoadingAiFeedback(false);
            }
          } else {
            console.warn('analysisId is missing in summaryData');
          }
        }
      } catch (e) {
        console.error("RDB保存APIエラー", e);
      }
    } catch (err) {
      console.error("API request error:", err);
      setError("評価の送信に失敗しました");
      setFeedback(null);
    } finally {
      setIsSending(false);
      setIsGeneratingFeedback(false);
    }
  };

  // 次のフレーズへ
  const handleNext = () => {
    if (currentIndex < practicePhrases.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setAudioUrl(null);
      setAudioBlob(null);
      setAssessmentResult(null);
      setFeedback(null);
      setAiFeedback(null);
      setAiFeedbackSections([]);
      setAiFeedbackError(null);
      setIsLoadingAiFeedback(false);
    } else {
      // 練習完了時にlocalStorageにサマリー保存＆API保存
      localStorage.setItem('lastPracticeXp', String(sessionXp));
      localStorage.setItem('lastPracticeMaxCombo', String(sessionMaxCombo));
      localStorage.setItem('lastPracticeBonus', JSON.stringify(bonusBreakdown));
      // 必要ならAPIでまとめて保存（例: postXpHistory(USER_ID, sessionXp, 'session')）
      // await postXpHistory(USER_ID, sessionXp, 'session');
      router.push("/practice/complete");
    }
  };

  // r/lミス箇所ハイライト用の関数
  function getRLHighlightElements(assessmentResult: any) {
    if (!assessmentResult?.NBest?.[0]?.Words) return null;
    const words = assessmentResult.NBest[0].Words;
    const displayText = assessmentResult.DisplayText || words.map((w: any) => w.Word).join(' ');
    // ミスがあった単語インデックスを特定
    const mistakeWordIndexes = new Set<number>();
    words.forEach((word: any, wIdx: number) => {
      if (!word?.Phonemes) return;
      for (const phoneme of word.Phonemes) {
        if ((phoneme.Phoneme === 'r' || phoneme.Phoneme === 'l') && phoneme.PronunciationAssessment) {
          const nBest = phoneme.PronunciationAssessment.NBestPhonemes;
          if (Array.isArray(nBest) && nBest.length > 0 && nBest[0].Phoneme !== phoneme.Phoneme) {
            mistakeWordIndexes.add(wIdx);
          }
        }
      }
    });
    // DisplayTextを単語ごとに分割し、ミスがあった単語を色付け
    const displayWords = displayText.split(/\s+/);
    return displayWords.map((word: string, idx: number) => (
      <span
        key={idx}
        className={
          mistakeWordIndexes.has(idx)
            ? 'bg-red-200 text-red-800 font-bold rounded px-1 mx-0.5'
            : 'text-black'
        }
      >
        {word + ' '}
      </span>
    ));
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">発音練習</h1>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="mb-2 text-lg font-semibold text-black">{`文 ${currentIndex + 1} / ${practicePhrases.length}`}</div>
        <div className="mb-4 text-xl text-black font-semibold">{practicePhrases[currentIndex]}</div>
        <div className="flex gap-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-2 rounded-full font-medium ${
              isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={isSending}
          >
            {isRecording ? "録音停止" : "録音開始"}
          </button>
        </div>
        {audioUrl && (
          <div className="mb-4">
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
        {audioUrl && (
          <button
            onClick={handleSend}
            className="mt-2 px-6 py-2 rounded-full font-medium bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400"
            disabled={isSending || isGeneratingFeedback}
          >
            {isSending ? "送信中..." : isGeneratingFeedback ? "評価中..." : "評価を送信"}
          </button>
        )}
        {error && (
          <div className="mt-4 text-red-600 font-medium text-center">
            {error}
          </div>
        )}
        {feedback && !error && (
          <div className="mt-4 text-2xl font-bold text-center text-blue-700">
            {feedback}
          </div>
        )}
        {assessmentResult && !error && (
          <div className="mt-4">
            <div className="text-lg font-medium mb-2 text-blue-900">評価結果:</div>
            {/* r/lミス箇所ハイライト表示 */}
            <div className="mb-2">
              <span className="text-sm text-black">r/lミス箇所ハイライト: </span>
              {getRLHighlightElements(assessmentResult)}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">正確性</div>
                  <div className="text-xl font-bold text-black">
                    {assessmentResult?.NBest?.[0]?.PronunciationAssessment?.AccuracyScore ?? 0}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">流暢さ</div>
                  <div className="text-xl font-bold text-black">
                    {assessmentResult?.NBest?.[0]?.PronunciationAssessment?.FluencyScore ?? 0}%
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="mt-6 w-full px-6 py-2 rounded-full font-medium bg-blue-500 hover:bg-blue-600 text-white"
            >
              次の文へ
            </button>
          </div>
        )}
        {aiFeedback && !aiFeedbackError && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 rounded">
            <div className="font-bold mb-1">AIフィードバック</div>
            {Array.isArray(aiFeedback?.sections)
              ? aiFeedback.sections.map((section: any, idx: number) => (
                  <div key={idx} className="bg-white p-2 rounded">
                    <div className="font-semibold text-blue-900">{section.title}</div>
                    <div className="text-sm text-gray-700">{section.content}</div>
                  </div>
                ))
              : <div className="text-gray-900 mt-2" style={{ whiteSpace: 'pre-line' }}>{aiFeedback}</div>
            }
          </div>
        )}
        {isLoadingAiFeedback && (
          <div className="mt-4 text-yellow-700">AIフィードバック生成中...</div>
        )}
        {aiFeedbackError && (
          <div className="mt-4 text-red-600">{aiFeedbackError}</div>
        )}
      </div>
      {/* コンボゲージ・XPアニメーション・フィーバーメッセージ */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs text-gray-500">COMBO</div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-pink-400 transition-all" style={{ width: `${Math.min(combo * 20, 100)}%` }} />
          </div>
          <div className="text-sm text-pink-700 font-bold mt-1">{combo}x</div>
          {fever && <div className="text-xs text-yellow-500 font-bold animate-pulse">FEVER!</div>}
          {feverMsg && <div className="text-xs text-blue-600 font-bold mt-1 animate-bounce">{feverMsg}</div>}
        </div>
        {xpGain !== null && (
          <div key={xpAnimKey} className="text-2xl font-bold text-yellow-500 animate-bounce">
            +{xpGain} XP
          </div>
        )}
        <div className="text-xs text-gray-500">MAX</div>
        <div className="text-lg font-bold text-purple-700">{maxCombo}x</div>
      </div>
    </div>
  );
} 