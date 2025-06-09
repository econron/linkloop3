"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRanking, getQuests } from '../../../lib/api';

const USER_ID = 'test-user'; // TODO: 実装時は動的に

export default function PracticeCompletePage() {
  const router = useRouter();
  // 追加: サマリー用state
  const [xp, setXp] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [rank, setRank] = useState<number | null>(null);
  const [prevRank, setPrevRank] = useState<number | null>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);
  const [bonus, setBonus] = useState<{ base: number; combo: number; fever: number }>({ base: 0, combo: 0, fever: 0 });

  useEffect(() => {
    // XP・最大コンボはlocalStorageから取得（練習画面で保存しておく想定）
    setXp(Number(localStorage.getItem('lastPracticeXp') ?? 0));
    setMaxCombo(Number(localStorage.getItem('lastPracticeMaxCombo') ?? 0));
    try {
      setBonus(JSON.parse(localStorage.getItem('lastPracticeBonus') ?? '{"base":0,"combo":0,"fever":0}'));
    } catch { setBonus({ base: 0, combo: 0, fever: 0 }); }
    // ランキング
    getUserRanking(USER_ID).then(res => {
      setRank(res.data?.rank ?? null);
      setPrevRank(res.data?.previousRank ?? null);
    });
    // クエスト
    getQuests(USER_ID).then(res => {
      setQuests(res.data ?? []);
      setCompletedQuests((res.data ?? []).filter((q: any) => q.completed));
    });
  }, []);

  // 追い抜き演出
  const showRankUp = prevRank && rank && prevRank > rank;

  // 3秒後に自動リダイレクト（任意）
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     router.push("/");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [router]);

  return (
    <div className="max-w-xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-green-600">練習完了！</h1>
      <div className="mb-6 w-full">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="text-lg font-bold text-blue-700 mb-2">今回の成果</div>
          <div className="flex gap-8 mb-2">
            <div className="text-center">
              <div className="text-xs text-gray-500">獲得XP</div>
              <div className="text-2xl font-bold text-yellow-500">+{xp}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">最大コンボ</div>
              <div className="text-2xl font-bold text-pink-500">{maxCombo}x</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">現在のランク</div>
              <div className="text-2xl font-bold text-purple-700">{rank ?? '-'}</div>
            </div>
          </div>
          {/* ボーナス内訳 */}
          <div className="mt-2 w-full">
            <div className="text-xs text-gray-500 font-bold mb-1">ボーナス内訳</div>
            <div className="flex gap-4 justify-center">
              <div className="text-xs text-gray-700">基本XP: <span className="font-bold text-yellow-600">+{bonus.base}</span></div>
              <div className="text-xs text-blue-700">コンボ: <span className="font-bold">+{bonus.combo}</span></div>
              <div className="text-xs text-pink-700">フィーバー: <span className="font-bold">+{bonus.fever}</span></div>
            </div>
          </div>
          {/* 追い抜き演出 */}
          {showRankUp && (
            <div className="mt-4 text-center animate-bounce">
              <span className="text-lg font-bold text-orange-500">{prevRank}位 → <span className="text-green-600">{rank}位</span></span><br/>
              <span className="text-sm text-green-700 font-bold">{prevRank - rank}人抜き！</span>
            </div>
          )}
          {/* クエスト達成演出 */}
          {completedQuests.length > 0 && (
            <div className="mt-4 w-full">
              <div className="text-xs text-green-700 font-bold mb-1">達成クエスト</div>
              <div className="flex flex-wrap gap-2">
                {completedQuests.map((q: any) => (
                  <div key={q.id} className="bg-green-100 border border-green-300 rounded px-3 py-1 text-xs text-green-900 font-bold animate-pulse">
                    {q.questId} 達成！
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => router.push("/")}
        className="px-8 py-3 rounded-full font-medium bg-blue-500 hover:bg-blue-600 text-white text-lg"
      >
        ホームに戻る
      </button>
    </div>
  );
} 