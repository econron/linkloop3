'use client';

import { useState } from 'react';
import { PhonemeCard } from '@/components/phoneme/PhonemeCard';

// 仮のデータ（後でAPIから取得するように変更）
const mockPhonemes = [
  {
    phoneme: 'r',
    ipa: 'r',
    example: 'right',
    status: 'in_progress' as const,
    averageScore: 75,
  },
  {
    phoneme: 'l',
    ipa: 'l',
    example: 'light',
    status: 'in_progress' as const,
    averageScore: 85,
  },
  {
    phoneme: 'θ',
    ipa: 'θ',
    example: 'think',
    status: 'not_started' as const,
  },
  {
    phoneme: 'ð',
    ipa: 'ð',
    example: 'this',
    status: 'not_started' as const,
  },
  {
    phoneme: 'ʃ',
    ipa: 'ʃ',
    example: 'she',
    status: 'not_started' as const,
  },
  {
    phoneme: 'ʒ',
    ipa: 'ʒ',
    example: 'vision',
    status: 'not_started' as const,
  },
];

export default function PhonemesPage() {
  const [phonemes] = useState(mockPhonemes);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">発音記号一覧</h1>
        <p className="mt-2 text-sm text-gray-500">
          各発音記号の練習状況と平均スコアを確認できます。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {phonemes.map((phoneme) => (
          <PhonemeCard
            key={phoneme.phoneme}
            {...phoneme}
          />
        ))}
      </div>
    </div>
  );
} 