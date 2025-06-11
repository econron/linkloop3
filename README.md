# linkloop3

## バックエンドのセットアップと起動

### 前提条件
- Docker Desktopがインストールされていること
- Node.js (v18以上)がインストールされていること

### セットアップ手順

1. バックエンドディレクトリに移動
```bash
cd backend
```

2. 依存関係のインストール
```bash
npm install
```

3. コンテナの起動
```bash
./setup.sh
```

4. データベースのマイグレーション
```bash
npx prisma migrate deploy
```

5. シードデータの投入
```bash
npx prisma db seed
```

### 開発サーバーの起動
```bash
npm run dev
```

### データベースの確認
Prisma Studioを使用してデータベースの内容を確認できます：
```bash
npx prisma studio
```
ブラウザで http://localhost:5556 にアクセスしてください。

### 注意事項
- 初回セットアップ時は、コンテナの起動に数分かかる場合があります
- マイグレーションとシードの実行は、コンテナが完全に起動してから行ってください

