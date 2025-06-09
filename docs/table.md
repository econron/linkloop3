# DBテーブル構成メモ（2024/06 現在）

## テーブル一覧と主なカラム

### 1. User
- id, createdAt, lastLoginAt
- unitProgress, phonemeProgress, phonemeErrorSummaries, pronunciationHabits, analyses（リレーション）

### 2. UnitProgress
- id, userId, unitId, status, lastAttempted, completedAt

### 3. PhonemeProgress
- id, userId, phoneme, attempts, averageScore, bestScore, lastScore, lastAttempted

### 4. PhonemeErrorSummary
- id, userId, intendedPhoneme, actualPhoneme, errorCount, lastOccurredAt, createdAt, updatedAt

### 5. PronunciationHabit
- id, userId, phoneme, confusedWith, accuracyScore, lastOccurredAt, createdAt, updatedAt

### 6. Unit
- id, title, description, metadata, createdAt, updatedAt

### 7. PronunciationAnalysis
- id, userId, unitId, overallScore, accuracyScore, fluencyScore, prosodyScore, createdAt

### 8. PronunciationFinding
- id, analysisId, type, phoneme, details, createdAt

---

## 各テーブルの用途（概要）

- **User**: ユーザー情報
- **UnitProgress**: ユーザーごとのユニット進捗
- **PhonemeProgress**: ユーザーごとの発音記号ごとの練習履歴・スコア
- **PhonemeErrorSummary**: ユーザーごとの音素誤り集計
- **PronunciationHabit**: ユーザーごとの発音の癖（誤り傾向）
- **Unit**: 学習ユニット
- **PronunciationAnalysis**: 発音評価（各ユニットごと）
- **PronunciationFinding**: 発音評価の詳細（誤り・癖・プロソディ等）

---

※ 詳細なカラムやリレーションは schema.prisma を参照 