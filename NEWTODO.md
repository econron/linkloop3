# ゲーミフィケーション要素 実装TODO

---

## 1. DB設計案

### 追加テーブル例

#### 1. XP（経験値）履歴
| カラム名         | 型         | 説明                       |
|------------------|------------|----------------------------|
| id               | PK         |                            |
| userId           | FK         | Userテーブル参照           |
| amount           | int        | 獲得XP量                   |
| reason           | string     | 獲得理由（combo, quest等） |
| createdAt        | datetime   |                            |

#### 2. Combo履歴（オプション）
| カラム名         | 型         | 説明                       |
|------------------|------------|----------------------------|
| id               | PK         |                            |
| userId           | FK         | Userテーブル参照           |
| comboCount       | int        | 最高コンボ数               |
| feverTime        | bool       | フィーバー突入有無         |
| createdAt        | datetime   |                            |

#### 3. Quest進捗
| カラム名         | 型         | 説明                       |
|------------------|------------|----------------------------|
| id               | PK         |                            |
| userId           | FK         | Userテーブル参照           |
| questId          | string     | クエスト識別子             |
| type             | string     | daily/weekly/achievement   |
| progress         | int        | 現在の進捗                 |
| target           | int        | 達成目標                   |
| completed        | bool       | 達成済みか                 |
| rewardXp         | int        | 報酬XP                     |
| updatedAt        | datetime   |                            |

#### 4. ランキング（集計用ビュー/キャッシュテーブル）
| カラム名         | 型         | 説明                       |
|------------------|------------|----------------------------|
| userId           | FK         | Userテーブル参照           |
| totalXp          | int        | 累計XP                     |
| weeklyXp         | int        | 週次XP                     |
| dailyXp          | int        | 日次XP                     |
| rank             | int        | 現在の順位                 |
| updatedAt        | datetime   |                            |

---

## 2. API設計案（openapi.yml拡張例）

### 1. XP履歴取得・加算
```
GET /xp-history?userId={userId}
POST /xp-history
  body: { userId, amount, reason }
```

### 2. クエスト進捗取得・更新
```
GET /quests?userId={userId}
POST /quests/progress
  body: { userId, questId, progress }
POST /quests/complete
  body: { userId, questId }
```

### 3. ランキング取得
```
GET /ranking/global
GET /ranking/weekly
GET /ranking/daily
GET /ranking/user?userId={userId}
```

---

## 3. 画面への統合方法

### 1. ホーム画面
- XPバーや現在のランクを表示
- 「今週のランキング」や「自分の順位」をサマリー表示
- クエスト進捗ウィジェットを追加

### 2. 練習画面
- コンボゲージ・フィーバータイム演出を常時表示
- 高評価連続時にアニメーションで「コンボ数」や「フィーバー突入」を強調
- XP獲得時はスロット風アニメーションでボーナス内訳を順次表示

### 3. 結果画面
- 「今回のXP獲得量」「ボーナス内訳」「ランキング順位変動」をアニメーションで表示
- 「追い抜き演出」や「クエスト達成演出」を追加

### 4. クエスト/ミッション画面
- デイリー/ウィークリー/実績クエストのリストと進捗バー
- 達成時は「報酬XP」や「バッジ」などを演出付きで表示

---

## 4. 実装イメージ（フロー）

1. 練習で高評価→フロントでcombo, fever, XP加算をローカルで管理
2. 練習終了時に `/xp-history` `/quests/progress` などAPIでサーバーに反映
3. ホーム・ランキング画面で `/ranking/weekly` などを取得し順位を表示
4. クエスト達成時は `/quests/complete` でサーバーに反映し、演出を表示

---

## 5. 注意点・提案

- XP/クエスト/ランキングはキャッシュや集計バッチで高速化推奨
- APIレスポンスは「現在のXP」「次のランクまでのXP」なども返すとUX向上
- クエスト内容や報酬はDBで柔軟に管理できる設計にするのが望ましい
- アニメーションや演出はUI/UXルールに従い、過度な演出は避ける

---

ご要望に応じて、Prismaスキーマ例やAPI詳細設計、フロント統合サンプルコードもご提案可能です。 