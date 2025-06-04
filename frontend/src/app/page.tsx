'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UnitCard } from '@/components/course/UnitCard';

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

export default function HomePage() {
  const router = useRouter();
  const [units, setUnits] = useState(mockUnits);

  const handleUnitClick = (unitId: string) => {
    router.push(`/units/${unitId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">コース進捗</h1>
        <p className="mt-2 text-sm text-gray-500">
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
