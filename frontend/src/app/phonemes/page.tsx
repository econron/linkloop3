'use client';

import { useState } from 'react';
import { PhonemeCard } from '@/components/phoneme/PhonemeCard';

// 全音素データ（ARPABET→IPA対応、例・ダミー進捗付き）
const PHONEMES = [
  // 母音
  { phoneme: 'AA', ipa: 'ɑ', example: 'bot, cot', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AE', ipa: 'æ', example: 'cat, bat', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AH', ipa: 'ʌ', example: 'but, cut', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AO', ipa: 'ɔ', example: 'caught, bought', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AX', ipa: 'ə', example: 'about, sofa', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AY', ipa: 'aɪ', example: 'bite, high', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'EH', ipa: 'ɛ', example: 'bed, met', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'ER', ipa: 'ɝ', example: 'bird, hurt', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AXR', ipa: 'ɚ', example: 'butter, doctor', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'EY', ipa: 'eɪ', example: 'bait, day', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'IH', ipa: 'ɪ', example: 'bit, sit', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'IY', ipa: 'i', example: 'beat, see', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'OW', ipa: 'oʊ', example: 'boat, go', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'OY', ipa: 'ɔɪ', example: 'boy, toy', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'UH', ipa: 'ʊ', example: 'book, put', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'UW', ipa: 'u', example: 'boot, moon', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'AW', ipa: 'aʊ', example: 'down, now', status: 'not_started' as const, averageScore: 0 },
  // 子音
  { phoneme: 'P', ipa: 'p', example: 'pan', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'B', ipa: 'b', example: 'ban', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'T', ipa: 't', example: 'tap', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'D', ipa: 'd', example: 'dab', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'K', ipa: 'k', example: 'cat, kick', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'G', ipa: 'g', example: 'go', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'CH', ipa: 'tʃ', example: 'church', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'JH', ipa: 'dʒ', example: 'judge', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'F', ipa: 'f', example: 'fan', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'V', ipa: 'v', example: 'van', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'TH', ipa: 'θ', example: 'thin, thigh', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'DH', ipa: 'ð', example: 'this, then', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'S', ipa: 's', example: 'sip', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'Z', ipa: 'z', example: 'zip', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'SH', ipa: 'ʃ', example: 'she, push', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'ZH', ipa: 'ʒ', example: 'measure, vision', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'HH', ipa: 'h', example: 'he', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'M', ipa: 'm', example: 'man', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'N', ipa: 'n', example: 'no', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'NG', ipa: 'ŋ', example: 'sing, ring', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'L', ipa: 'l', example: 'left', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'R', ipa: 'r', example: 'red', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'W', ipa: 'w', example: 'we', status: 'not_started' as const, averageScore: 0 },
  { phoneme: 'Y', ipa: 'j', example: 'yes', status: 'not_started' as const, averageScore: 0 },
];

export default function PhonemesPage() {
  const [phonemes] = useState(PHONEMES);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">発音記号一覧</h1>
        <p className="mt-2 text-sm text-black">
          各発音記号の練習状況と平均スコアを確認できます。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {phonemes.map((phoneme) => (
          <PhonemeCard
            key={phoneme.ipa}
            ipa={phoneme.ipa}
            arpabet={phoneme.phoneme}
            example={phoneme.example}
            status={phoneme.status}
            averageScore={phoneme.averageScore}
          />
        ))}
      </div>
    </div>
  );
} 