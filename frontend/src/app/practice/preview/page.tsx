"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const lessonConfigs = {
  'rl': {
    phonemes: ['r', 'l'],
    title: 'R/L発音練習',
    color: 'blue',
    description: 'RとLの音の区別を練習します',
    tips: ['舌の位置を意識して', 'Rは巻き舌、Lは舌を上あごに']
  },
  'th': {
    phonemes: ['θ', 'ð'],
    title: 'TH発音練習',
    color: 'green',
    description: 'THの正しい音を練習します',
    tips: ['舌を軽く歯に当てて', '息を舌の上から出すように']
  },
  'vf': {
    phonemes: ['v', 'f'],
    title: 'V/F発音練習',
    color: 'purple',
    description: 'VとFの音の区別を練習します',
    tips: ['下唇を上の歯に軽く当てて', 'Vは声帯を震わせる']
  }
};

const phrases = {
  'rl': [
    'Really lucky rabbit.',
    'Roll the red ball.',
    'Light and right.',
  ],
  'th': [
    'Think about it carefully.',
    'This is the best thing.',
    'Thank you for everything.'
  ],
  'vf': [
    'Very funny video.',
    'Five vivid flowers.',
    'Voice and face.'
  ]
};

export default function PracticePreviewPage() {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState('th');
  const lesson = lessonConfigs[currentLesson];
  const lessonPhrases = phrases[currentLesson];

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
        {/* レッスン選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">レッスン選択</label>
          <select
            value={currentLesson}
            onChange={(e) => setCurrentLesson(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
          >
            {Object.entries(lessonConfigs).map(([key, config]) => (
              <option key={key} value={key}>{config.title}</option>
            ))}
          </select>
        </div>

        {/* レッスン概要 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <p className="text-gray-600 mb-4">{lesson.description}</p>
        </div>

        {/* 今回の対象発音記号 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-yellow-200 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-bold text-yellow-800 mb-3">
              🎯 今回のターゲット発音記号
            </h2>
            <div className="flex justify-center gap-3 mb-4">
              {lesson.phonemes.map((phoneme, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-100 border-2 border-yellow-400 rounded-full px-6 py-3 text-2xl font-bold text-yellow-800"
                >
                  /{phoneme}/
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">
                ✨ これらの発音記号で90%以上のスコアを出すとフィーバー！
              </p>
              <p className="text-yellow-700 text-sm">
                フィーバー時は獲得XPが2倍になります
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                それ以外の発音記号で90%以上なら+0.5倍ボーナス！
              </p>
            </div>
          </div>
        </div>

        {/* 発音のコツ */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">💡 発音のコツ</h3>
          <ul className="space-y-1">
            {lesson.tips.map((tip, idx) => (
              <li key={idx} className="text-blue-700 text-sm">• {tip}</li>
            ))}
          </ul>
        </div>

        {/* 練習フレーズプレビュー */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">📝 練習フレーズ</h3>
          <div className="space-y-2">
            {lessonPhrases.map((phrase, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-6">{idx + 1}.</span>
                <span className="text-gray-700">{phrase}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push(`/practice?lesson=${currentLesson}`)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105"
        >
          練習を開始する
        </button>
      </div>
    </div>
  );
} 