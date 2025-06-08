interface PhonemeAdvice {
  description: string;
  tips: string[];
  commonMistakes: string[];
  practiceWords: string[];
}

interface HabitAdvice {
  description: string;
  improvementTips: string[];
  practiceExercises: string[];
}

export const PHONEME_ADVICE: Record<string, PhonemeAdvice> = {
  'l': {
    description: 'L音は、舌先を上の歯の後ろに当てて発音します。',
    tips: [
      '舌先を上の歯の後ろに軽く当てます',
      '息を舌の両側から出します',
      '声を出しながら舌を離します'
    ],
    commonMistakes: [
      '舌先が歯に当たらない',
      'R音と混同する',
      '音が弱すぎる'
    ],
    practiceWords: ['light', 'love', 'ball', 'feel']
  },
  'r': {
    description: 'R音は、舌を後ろに引いて発音します。',
    tips: [
      '舌を後ろに引きます',
      '舌先を上に丸めます',
      '唇を少し丸めます'
    ],
    commonMistakes: [
      'L音と混同する',
      '舌が前すぎる',
      '音が弱すぎる'
    ],
    practiceWords: ['right', 'red', 'car', 'door']
  },
  // 他の音素のアドバイスも同様に追加
};

export const HABIT_ADVICE: Record<string, HabitAdvice> = {
  'l-r': {
    description: 'L音とR音の区別が不明確な傾向があります。',
    improvementTips: [
      'L音とR音の違いを意識して練習しましょう',
      '鏡を見ながら舌の位置を確認しましょう',
      '録音して自分の発音を確認しましょう'
    ],
    practiceExercises: [
      'light-right, love-red などの最小対を練習',
      '舌の位置を意識した発音練習',
      'ゆっくりと正確に発音する練習'
    ]
  },
  // 他の癖のアドバイスも同様に追加
};

export const GENERAL_ADVICE = {
  lowAccuracy: '発音の正確さを向上させるために、以下の点に注意しましょう：',
  lowFluency: '流暢さを向上させるために、以下の点に注意しましょう：',
  lowProsody: 'リズムとイントネーションを改善するために、以下の点に注意しましょう：',
  improvement: '前回と比べて改善が見られます。引き続き練習を続けましょう。',
  needsPractice: 'この音素は特に注意が必要です。集中的に練習しましょう。'
}; 