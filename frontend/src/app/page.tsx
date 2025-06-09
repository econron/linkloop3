'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnitCard } from '@/components/course/UnitCard';
import { getUserRanking, getRanking, getQuests, getXpHistory } from '../lib/api';

// 仮のデータ（後でAPIから取得するように変更）
const mockUnits = [
  {
    id: '1',
    title: 'Unit 1: 基本的な発音',
    description: 'rとlの発音の違いを学びます',
    status: 'unlocked' as const,
    progress: 0,
  },
  {
    id: '2',
    title: 'Unit 2: 単語の発音',
    description: '基本的な単語での発音練習',
    status: 'locked' as const,
    progress: 0,
  },
  {
    id: '3',
    title: 'Unit 3: 文章の発音',
    description: '文章での発音練習',
    status: 'locked' as const,
    progress: 0,
  },
];

const USER_ID = 'test-user'; // TODO: 実装時は動的に

export default function HomePage() {
  const router = useRouter();
  const [units, setUnits] = useState(mockUnits);
  // 追加: ゲーミフィケーション用state
  const [xp, setXp] = useState<number>(0);
  const [rank, setRank] = useState<number | null>(null);
  const [weeklyRanking, setWeeklyRanking] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);

  useEffect(() => {
    // XP・ランク
    getUserRanking(USER_ID).then(res => {
      setXp(res.data?.totalXp ?? 0);
      setRank(res.data?.rank ?? null);
    }).catch(() => {});
    // 週間ランキング
    getRanking('weekly').then(res => {
      setWeeklyRanking(res.data ?? []);
    }).catch(() => {});
    // クエスト
    getQuests(USER_ID).then(res => {
      setQuests(res.data ?? []);
    }).catch(() => {});
  }, []);

  const handleUnitClick = (unitId: string) => {
    router.push(`/units/${unitId}`);
  };

  return (
    <div className="space-y-8">
      {/* XPバー・ランク表示 */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-500">XP</div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(xp / 20, 100)}%` }}
              />
            </div>
            <div className="text-sm text-blue-700 font-bold mt-1">{xp} XP</div>
          </div>
          <div className="text-xs text-gray-500">RANK</div>
          <div className="text-lg font-bold text-purple-700">{rank ?? '-'}</div>
        </div>
      </div>

      {/* 週間ランキングサマリー */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">今週のランキングTOP5</div>
        <div className="flex gap-2">
          {weeklyRanking.slice(0, 5).map((user, idx) => (
            <div key={user.userId} className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-700">
              #{user.rank} {user.userId === USER_ID ? <b>あなた</b> : `User${user.userId.slice(-4)}`}<br/>
              {user.weeklyXp} XP
            </div>
          ))}
        </div>
      </div>

      {/* クエスト進捗ウィジェット */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">クエスト進捗</div>
        <div className="flex flex-wrap gap-2">
          {quests.length === 0 && <div className="text-gray-400 text-xs">クエストなし</div>}
          {quests.map((q: any) => (
            <div key={q.id} className="bg-green-50 border border-green-200 rounded px-3 py-2 min-w-[120px]">
              <div className="text-xs font-bold text-green-700 mb-1">{q.questId}</div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-green-400" style={{ width: `${Math.min((q.progress / q.target) * 100, 100)}%` }} />
              </div>
              <div className="text-xs text-green-800">{q.progress} / {q.target}</div>
              {q.completed && <div className="text-xs text-blue-600 font-bold mt-1">達成！</div>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-black">コース進捗</h1>
        <p className="mt-2 text-sm text-black">
          各ユニットを完了して、発音スキルを向上させましょう。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            {...unit}
            onClick={() => handleUnitClick(unit.id)}
          />
        ))}
      </div>
    </div>
  );
}
