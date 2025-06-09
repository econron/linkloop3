'use client';

import { useState } from 'react';
import { PhonemeCard } from '@/components/phoneme/PhonemeCard';

// 全音素データ（ARPABET→IPA対応、例・ダミー進捗付き）
const PHONEMES = [
  // 母音
  { phoneme: 'AA', ipa: 'ɑ', example: 'bot, cot', status: 'not_started' as const, count: 0, scoreMode: 75 },
  { phoneme: 'AE', ipa: 'æ', example: 'cat, bat', status: 'not_started' as const, count: 1, scoreMode: 80 },
  { phoneme: 'AH', ipa: 'ʌ', example: 'but, cut', status: 'not_started' as const, count: 2, scoreMode: 90 },
  { phoneme: 'AO', ipa: 'ɔ', example: 'caught, bought', status: 'not_started' as const, count: 3, scoreMode: 60 },
  { phoneme: 'AX', ipa: 'ə', example: 'about, sofa', status: 'not_started' as const, count: 4, scoreMode: 78 },
  { phoneme: 'AY', ipa: 'aɪ', example: 'bite, high', status: 'not_started' as const, count: 5, scoreMode: 85 },
  { phoneme: 'EH', ipa: 'ɛ', example: 'bed, met', status: 'not_started' as const, count: 6, scoreMode: 79 },
  { phoneme: 'ER', ipa: 'ɝ', example: 'bird, hurt', status: 'not_started' as const, count: 7, scoreMode: 70 },
  { phoneme: 'AXR', ipa: 'ɚ', example: 'butter, doctor', status: 'not_started' as const, count: 8, scoreMode: 82 },
  { phoneme: 'EY', ipa: 'eɪ', example: 'bait, day', status: 'not_started' as const, count: 9, scoreMode: 88 },
  { phoneme: 'IH', ipa: 'ɪ', example: 'bit, sit', status: 'not_started' as const, count: 10, scoreMode: 65 },
  { phoneme: 'IY', ipa: 'i', example: 'beat, see', status: 'not_started' as const, count: 11, scoreMode: 92 },
  { phoneme: 'OW', ipa: 'oʊ', example: 'boat, go', status: 'not_started' as const, count: 12, scoreMode: 77 },
  { phoneme: 'OY', ipa: 'ɔɪ', example: 'boy, toy', status: 'not_started' as const, count: 13, scoreMode: 80 },
  { phoneme: 'UH', ipa: 'ʊ', example: 'book, put', status: 'not_started' as const, count: 14, scoreMode: 74 },
  { phoneme: 'UW', ipa: 'u', example: 'boot, moon', status: 'not_started' as const, count: 15, scoreMode: 81 },
  { phoneme: 'AW', ipa: 'aʊ', example: 'down, now', status: 'not_started' as const, count: 16, scoreMode: 79 },
  // 子音
  { phoneme: 'P', ipa: 'p', example: 'pan', status: 'not_started' as const, count: 17, scoreMode: 60 },
  { phoneme: 'B', ipa: 'b', example: 'ban', status: 'not_started' as const, count: 18, scoreMode: 85 },
  { phoneme: 'T', ipa: 't', example: 'tap', status: 'not_started' as const, count: 19, scoreMode: 90 },
  { phoneme: 'D', ipa: 'd', example: 'dab', status: 'not_started' as const, count: 20, scoreMode: 78 },
  { phoneme: 'K', ipa: 'k', example: 'cat, kick', status: 'not_started' as const, count: 21, scoreMode: 80 },
  { phoneme: 'G', ipa: 'g', example: 'go', status: 'not_started' as const, count: 22, scoreMode: 70 },
  { phoneme: 'CH', ipa: 'tʃ', example: 'church', status: 'not_started' as const, count: 23, scoreMode: 88 },
  { phoneme: 'JH', ipa: 'dʒ', example: 'judge', status: 'not_started' as const, count: 24, scoreMode: 92 },
  { phoneme: 'F', ipa: 'f', example: 'fan', status: 'not_started' as const, count: 25, scoreMode: 75 },
  { phoneme: 'V', ipa: 'v', example: 'van', status: 'not_started' as const, count: 26, scoreMode: 80 },
  { phoneme: 'TH', ipa: 'θ', example: 'thin, thigh', status: 'not_started' as const, count: 27, scoreMode: 79 },
  { phoneme: 'DH', ipa: 'ð', example: 'this, then', status: 'not_started' as const, count: 28, scoreMode: 60 },
  { phoneme: 'S', ipa: 's', example: 'sip', status: 'not_started' as const, count: 29, scoreMode: 85 },
  { phoneme: 'Z', ipa: 'z', example: 'zip', status: 'not_started' as const, count: 30, scoreMode: 90 },
  { phoneme: 'SH', ipa: 'ʃ', example: 'she, push', status: 'not_started' as const, count: 31, scoreMode: 78 },
  { phoneme: 'ZH', ipa: 'ʒ', example: 'measure, vision', status: 'not_started' as const, count: 32, scoreMode: 80 },
  { phoneme: 'HH', ipa: 'h', example: 'he', status: 'not_started' as const, count: 33, scoreMode: 74 },
  { phoneme: 'M', ipa: 'm', example: 'man', status: 'not_started' as const, count: 34, scoreMode: 81 },
  { phoneme: 'N', ipa: 'n', example: 'no', status: 'not_started' as const, count: 35, scoreMode: 79 },
  { phoneme: 'NG', ipa: 'ŋ', example: 'sing, ring', status: 'not_started' as const, count: 36, scoreMode: 77 },
  { phoneme: 'L', ipa: 'l', example: 'left', status: 'not_started' as const, count: 37, scoreMode: 80 },
  { phoneme: 'R', ipa: 'r', example: 'red', status: 'not_started' as const, count: 38, scoreMode: 90 },
  { phoneme: 'W', ipa: 'w', example: 'we', status: 'not_started' as const, count: 39, scoreMode: 85 },
  { phoneme: 'Y', ipa: 'j', example: 'yes', status: 'not_started' as const, count: 40, scoreMode: 92 },
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
            count={phoneme.count}
            scoreMode={phoneme.scoreMode}
          />
        ))}
      </div>
    </div>
  );
} 