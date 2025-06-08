"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// r/lフレーズ5つ（サンプル）
const practicePhrases = [
  "Actions speak louder than words.",
  "The early bird catches the worm.",
  "call for",
  "All is well that ends well.",
  "alive (dead or alive)"
];

export default function PracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter();

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
    const formData = new FormData();
    formData.append("audio", audioBlob, `recording-${practicePhrases[currentIndex]}.wav`);
    formData.append("referenceText", practicePhrases[currentIndex]);
    try {
      // 1. 発音評価API呼び出し
      const res = await fetch("http://localhost:4000/api/pronunciation-assessment-advanced", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAssessmentResult(data);
      // PronScoreまたはAccuracyScoreでフィードバック
      const pronScore = data?.NBest?.[0]?.PronunciationAssessment?.PronScore ?? 0;
      if (pronScore < 70) setFeedback("Nice!");
      else if (pronScore < 90) setFeedback("Good!");
      else setFeedback("Super!");

      // 2. DynamoDBに生データ保存
      try {
        await fetch("http://localhost:4000/api/pronunciation-assessment/save-raw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "test-user", // TODO: 実装時は動的に
            unitId: "unit-1",    // TODO: 実装時は動的に
            phrase: practicePhrases[currentIndex],
            rawResult: data,
          }),
        });
      } catch (e) {
        console.error("DynamoDB保存APIエラー", e);
      }

      // 3. RDBにミス発音組み合わせを保存
      try {
        await fetch("http://localhost:4000/api/pronunciation-assessment/save-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "test-user", // TODO: 実装時は動的に
            azureResponse: data,
          }),
        });
      } catch (e) {
        console.error("RDB保存APIエラー", e);
      }
    } catch (err) {
      setFeedback("APIリクエストに失敗しました");
    } finally {
      setIsSending(false);
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
    } else {
      router.push("/practice/complete");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">発音練習</h1>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="mb-2 text-lg font-semibold">{`文 ${currentIndex + 1} / ${practicePhrases.length}`}</div>
        <div className="mb-4 text-xl">{practicePhrases[currentIndex]}</div>
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
            className="mt-2 px-6 py-2 rounded-full font-medium bg-green-500 hover:bg-green-600 text-white"
            disabled={isSending}
          >
            {isSending ? "送信中..." : "評価を送信"}
          </button>
        )}
        {feedback && (
          <div className="mt-4 text-2xl font-bold text-center">
            {feedback}
          </div>
        )}
        {assessmentResult && (
          <button
            onClick={handleNext}
            className="mt-6 w-full px-6 py-2 rounded-full font-medium bg-blue-500 hover:bg-blue-600 text-white"
          >
            次の文へ
          </button>
        )}
      </div>
    </div>
  );
} 