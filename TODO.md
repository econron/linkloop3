# 実装TODOリスト

## 環境構築

### フロントエンド
- [x] Next.jsプロジェクトの初期化
- [x] TypeScript設定
- [x] TailwindCSS設定
- [x] ESLint/Prettier設定
- [x] 必要なパッケージのインストール
  - [x] React
  - [x] TypeScript
  - [x] TailwindCSS
  - [ ] その他必要なライブラリ

### バックエンド
- [x] TypeScriptプロジェクトの初期化
- [x] Prisma設定
- [x] SQLite設定
- [x] ESLint/Prettier設定
- [x] 必要なパッケージのインストール
  - [x] Prisma
  - [x] Fastify
  - [ ] その他必要なライブラリ

## データベース設計

### スキーマ定義
- [x] Userモデルの定義
- [x] UnitProgressモデルの定義
- [x] PhonemeProgressモデルの定義
- [x] PracticeResultモデルの定義
- [x] マイグレーションファイルの作成

### データアクセス層
- [ ] データベース接続の設定
- [ ] CRUD操作の実装
- [ ] トランザクション処理の実装

## フロントエンド実装

### 共通コンポーネント
- [x] レイアウトコンポーネント
- [x] ナビゲーションコンポーネント
- [x] ボタンコンポーネント
- [ ] フィードバックコンポーネント

### 画面実装
- [x] ホーム画面
  - [x] コース進捗表示
  - [x] IPA発音記号一覧表示
  - [x] タブ切り替え機能
- [x] ユニット画面
  - [x] 動画再生機能
  - [x] インタラクティブ会話機能
  - [x] 次へボタン
  - [x] 動画ファイルの配置
  - [x] APIとの連携
- [x] 練習画面
  - [x] r/lフレーズをexpressions_with_ipa_flags.csvから5つ抽出（※現状はサンプル配列で仮実装済み）
  - [x] フレーズ表示UIの実装
  - [x] 録音機能の実装
  - [x] /api/pronunciation-assessment-advanced へのAPI連携
  - [x] スコア・フィードバック（Nice!/Good!/Super!）表示ロジック実装
  - [x] レスポンスをDB保存APIへ送信（DynamoDB/RDB両方）
  - [x] 5文完了で完了画面に遷移
- [ ] 完了画面
  - [ ] お祝いメッセージ表示
  - [ ] ホーム画面へのリダイレクト

### 状態管理
- [ ] ユーザー進捗の状態管理
- [ ] 練習結果の状態管理
- [ ] 画面遷移の状態管理

## バックエンド実装

### API実装
- [ ] ユーザー進捗取得API
- [ ] 練習結果保存API
- [ ] 発音記号進捗更新API

### 音声認識
- [ ] Azure Speech Services接続
- [ ] 音声認識処理
- [ ] スコアリング処理
- [ ] エラーハンドリング

## テスト実装

### 単体テスト
- [ ] スコアリングシステムのテスト
- [ ] データアクセス層のテスト
- [ ] コンポーネントのテスト

### 統合テスト
- [ ] 音声認識フローのテスト
- [ ] 画面遷移のテスト
- [ ] データ永続化のテスト

## デバッグと最適化

### デバッグ
- [ ] エラーログの実装
- [ ] デバッグツールの設定
- [ ] エラー処理の確認

### 最適化
- [ ] パフォーマンス計測
- [ ] コード最適化
- [ ] メモリ使用量の確認

## ドキュメント

### 技術ドキュメント
- [ ] API仕様書
- [ ] データベース設計書
- [ ] コンポーネント設計書

### ユーザードキュメント
- [ ] 使い方ガイド
- [ ] トラブルシューティングガイド

## 優先順位

### Phase 1: 基本機能実装
1. 環境構築
2. データベース設計
3. 基本的な画面遷移
4. 音声認識の基本機能

### Phase 2: コア機能強化
1. 進捗管理システム
2. 詳細なスコアリング
3. フィードバック表示

### Phase 3: 機能拡張
1. インタラクティブ会話
2. 詳細な統計情報
3. UI/UX改善

## 注意事項
- 音声認識の精度はAPI依存のため、実装時に適宜調整
- エッジケースは基本的に考慮しないが、スコアが30以下の場合はヘルプメッセージを表示
- パフォーマンスは一旦無視して実装を進める
- ローカルホストでの開発を前提とする

## DynamoDB Local運用・データ保存タスク
- [x] docker-compose + setup.shでDynamoDB Localをローカル永続化付きで起動
- [x] バックエンドAPIからDynamoDBへの保存が正常に動作するかテスト
- [x] フロントエンドから評価結果を保存API（/pronunciation-assessment/save-raw）にPOSTする処理を追加
- [x] 保存されたデータの確認（dynamodb_data配下のファイルやAWS CLIで確認）
- [x] RDB保存APIとの連携や、集計・分析APIの設計・実装

## TODOリスト: 発音の癖 集計機能の実装 (単体機能版)
このTODOリストは、Azure Speech Serviceからのレスポンスを受け取り、phoneme_error_summariesテーブルに直接、間違いの癖を集計・保存する機能の実装を目的とします。

### フェーズ1: データベースの準備 (DB Setup)
- [x] 1. 集計用テーブルを作成する

データベースに以下のSQLを実行して、phoneme_error_summariesテーブルを作成します。すでに作成済みの場合はこのステップは不要です。

```sql
CREATE TABLE phoneme_error_summaries (
    user_id BIGINT NOT NULL,
    intended_phoneme VARCHAR(10) NOT NULL,
    actual_phoneme VARCHAR(10) NOT NULL,
    error_count INT NOT NULL DEFAULT 1,
    last_occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, intended_phoneme, actual_phoneme)
    -- usersテーブルが別にあれば、以下の外部キー制約を追加します
    -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### フェーズ2: コアロジックの実装 (Core Logic Implementation)
- [x] 2. Azureレスポンスを処理し、DBを更新する関数を実装する

アプリケーションのバックエンドに、以下の処理を行う関数（例: updatePronunciationSummary）を実装します。

**関数の入力:**
- userId: 評価対象のユーザーID
- azureResponse: Azure Pronunciation Assessment APIからのレスポンスJSONオブジェクト

**関数の処理フロー:**
- ステップ 2-1: 間違い音素ペアの抽出
  - azureResponse内のNBest[0].Words配列をループ処理
  - 各Wordオブジェクト内のPhonemes配列をさらにループ処理
  - 各Phonemeオブジェクトについて、PronunciationAssessment.ErrorTypeが "Mispronunciation" かどうかをチェック
  - ErrorTypeが"Mispronunciation"の場合、以下のマッピングに従って「本来の音素」と「間違った音素」を取得
    - intended_phoneme: Phoneme.Phoneme
    - actual_phoneme: Phoneme.PronunciationAssessment.NBestPhonemes[0].Phoneme
- ステップ 2-2: データベースの更新 (UPSERT)
  - 上記で取得したペア { intended, actual } のリストをループ
  - user_id, intended_phoneme, actual_phonemeをキーにUPSERT
    - 存在すればerror_count+1, last_occurred_at/updated_at更新
    - なければINSERT

- [x] 3. 上記ロジックの疑似コードを確認する

```pseudo
function updatePronunciationSummary(userId, azureResponse):
  // ステップ 2-1: 間違い音素ペアの抽出
  errorPairs = []
  for each word in azureResponse.NBest[0].Words:
    for each phoneme in word.Phonemes:
      if phoneme.PronunciationAssessment.ErrorType == "Mispronunciation":
        if phoneme.PronunciationAssessment.NBestPhonemes and phoneme.PronunciationAssessment.NBestPhonemes.length > 0:
          intended = phoneme.Phoneme
          actual = phoneme.PronunciationAssessment.NBestPhonemes[0].Phoneme
          errorPairs.add({ intended: intended, actual: actual })
  // ステップ 2-2: データベースの更新
  for each pair in errorPairs:
    // UPSERT
    UPSERT phoneme_error_summaries
    SET error_count = error_count + 1, last_occurred_at = NOW()
    WHERE user_id = userId AND intended_phoneme = pair.intended AND actual_phoneme = pair.actual
```

### フェーズ3: APIの実装と活用 (API & Application)
- [x] 4. 発音評価を実行し、結果を処理するAPIエンドポイントを作成する
  - クライアントから発音データを受け取り、Azure APIを呼び出すエンドポイント（例: POST /api/pronunciation-assessments）を作成
  - このエンドポイント内でAzure APIからレスポンスを受け取った後、updatePronunciationSummary関数を呼び出してDBを更新
- [x] 5. 集計結果をユーザーに返すAPIエンドポイントを作成する
  - phoneme_error_summariesテーブルから特定のユーザーの間違いの癖をerror_countの降順で取得して返すエンドポイント（例: GET /api/users/{userId}/pronunciation/summary）を作成

### フェーズ4: テストと堅牢化 (Testing & Robustness)
- [x] 6. コアロジックの単体テストを記述する
  - updatePronunciationSummary関数に対して、以下のパターンのテストデータ（JSON）を用意し、DBが正しく更新されることを確認
    - Mispronunciationエラーが複数含まれるケース
    - Mispronunciationエラーが存在しないケース
    - NBestPhonemes配列が空、または存在しないケース
- [x] 7. エラーハンドリングを実装する
  - Azure API呼び出しが失敗した場合や、データベースの更新処理に失敗した場合の例外処理を適切に実装 