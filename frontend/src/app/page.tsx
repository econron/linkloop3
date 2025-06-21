'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnitCard } from '@/components/course/UnitCard';
import { getUserRanking, getRanking, getQuests, getXpHistory } from '../lib/api';
import { curriculumData } from '@/data/curriculum';
import { CompetencyStage } from '@/types/curriculum';
import { getTotalXP, loadGameProgress } from '@/lib/gamification';

// カリキュラムデータからグループ化されたユニットを生成
const generateGroupedUnitsFromCurriculum = () => {
  const groups: Array<{
    competencyId: string;
    competencyTitle: string;
    competencyDescription: string;
    phonemes: string[];
    stages: Array<{
      id: string;
      title: string;
      description: string;
      status: 'unlocked' | 'locked' | 'completed';
      progress: number;
      stageType: 'lecture' | 'perception' | 'production';
    }>;
  }> = [];

  curriculumData.competencies.forEach((competency) => {
    const stageTypeNames = {
      lecture: '講義',
      perception: '知覚練習', 
      production: '発音練習'
    };

    const stages = competency.stages.map((stage) => ({
      id: stage.id,
      title: stageTypeNames[stage.type],
      description: stage.description,
      status: 'unlocked' as const, // stage.unlocked ? 'unlocked' as const : 'locked' as const,
      progress: stage.completed ? 100 : 0,
      stageType: stage.type
    }));

    groups.push({
      competencyId: competency.id,
      competencyTitle: competency.title,
      competencyDescription: competency.description,
      phonemes: competency.phonemes,
      stages
    });
  });

  return groups;
};

const USER_ID = 'test-user'; // TODO: 実装時は動的に

export default function HomePage() {
  const router = useRouter();
  const [unitGroups, setUnitGroups] = useState(() => generateGroupedUnitsFromCurriculum());
  // 追加: ゲーミフィケーション用state
  const [xp, setXp] = useState<number>(0);
  const [gamificationXP, setGamificationXP] = useState<number>(0);
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
    
    // Load gamification XP
    setGamificationXP(getTotalXP());
  }, []);

  // Update gamification XP on focus (when user returns from other pages)
  useEffect(() => {
    const handleFocus = () => {
      setGamificationXP(getTotalXP());
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleUnitClick = (stageId: string, stageType: 'lecture' | 'perception' | 'production') => {
    // 段階に応じて適切なページに遷移
    switch (stageType) {
      case 'lecture':
        router.push(`/units/${stageId}`);
        break;
      case 'perception':
        router.push(`/quiz/${stageId}`);
        break;
      case 'production':
        router.push(`/practice/${stageId}`);
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* XPバー・ランク表示 */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-500">Backend XP</div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(xp / 20, 100)}%` }}
              />
            </div>
            <div className="text-sm text-blue-700 font-bold mt-1">{xp} XP</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500">Learning XP</div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${Math.min(gamificationXP / 100, 100)}%` }}
              />
            </div>
            <div className="text-sm text-green-700 font-bold mt-1">{gamificationXP} XP</div>
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

      {/* Beta Lessons Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border-2 border-dashed border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            BETA
          </div>
          <h2 className="text-xl font-bold text-purple-800">ベータレッスン</h2>
        </div>
        <p className="text-sm text-purple-700 mb-4">
          新機能をテスト中です。フィードバックをお待ちしています！
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <button 
            onClick={() => router.push('/beta-lesson')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 text-left"
          >
            <div className="font-bold text-white flex items-center gap-2">
              ⭐ 2分間R/L体験レッスン
            </div>
            <div className="text-sm text-purple-100 mt-1">完全理解への特別レッスン</div>
          </button>
          <button 
            onClick={() => router.push('/quiz/SEG-LIQUID-LR-007-2')}
            className="bg-white border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium text-purple-800">R/L 聞き分けクイズ</div>
            <div className="text-sm text-purple-600 mt-1">流音の識別練習</div>
          </button>
          <button 
            onClick={() => router.push('/practice/SEG-LIQUID-LR-007-3')}
            className="bg-white border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium text-purple-800">R/L 発音練習</div>
            <div className="text-sm text-purple-600 mt-1">音素の生成練習</div>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-black">コース進捗</h1>
        <p className="mt-2 text-sm text-black">
          各ユニットを完了して、発音スキルを向上させましょう。
        </p>
      </div>

      {/* Grouped Unit Cards */}
      <div className="space-y-8">
        {unitGroups.map((group) => (
          <div key={group.competencyId} className="bg-white rounded-lg shadow-lg p-6">
            {/* Group Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-800">{group.competencyTitle}</h2>
                <div className="flex gap-1">
                  {group.phonemes.map((phoneme, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                    >
                      {phoneme}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{group.competencyDescription}</p>
              
              {/* Progress indicator for the group */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>進捗</span>
                  <span>{group.stages.filter(s => s.progress === 100).length}/{group.stages.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(group.stages.filter(s => s.progress === 100).length / group.stages.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stage Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {group.stages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  {/* Stage number badge */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                    {index + 1}
                  </div>
                  
                  <UnitCard
                    id={stage.id}
                    title={stage.title}
                    description={stage.description}
                    status={stage.status}
                    progress={stage.progress}
                    onClick={() => handleUnitClick(stage.id, stage.stageType)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
