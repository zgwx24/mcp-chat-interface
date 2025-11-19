# MCP Client Chat

An open-source AI chatbot app powered by Model Context Protocol (MCP), built with Next.js and the AI SDK by Vercel.

## 特徴

- **複数のAIプロバイダー対応**: OpenAI、Anthropic、Groq、XAIなど複数のAIプロバイダーを切り替えて使用可能
- **ストリーミング応答**: AI SDK by Vercelによるリアルタイムのストリーミングテキスト応答
- **MCP統合**: Model Context Protocol (MCP) サーバーとの完全統合により、利用可能なツールと機能を拡張
- **HTTP/SSE対応**: 様々なMCPツールプロバイダーに接続可能なHTTPおよびSSEトランスポートタイプ
- **推論モデルサポート**: 推論能力を持つモデルをサポート
- **モダンなUI**: shadcn/uiコンポーネントとTailwind CSSによるレスポンシブなUI
- **Next.js App Router**: 最新のNext.js App Routerで構築

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または pnpm
- PostgreSQLデータベース（AWS RDS、Neon、その他のPostgreSQL互換データベース）

### インストール手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/sakoda007/mcp-client-chat.git
cd mcp-client-chat
```

2. **依存関係のインストール**

```bash
npm install
# または
pnpm install
```

3. **環境変数の設定**

プロジェクトルートに`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース接続URL（PostgreSQL）
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# AI API キー（使用するプロバイダーのキーを設定）
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
XAI_API_KEY="xai-..."
```

**データベース接続URLの形式：**
- AWS RDSの場合: `postgresql://username:password@host:5432/database?sslmode=require`
- SSL証明書の検証を無効にする場合: `?sslmode=no-verify`（開発環境のみ推奨）

4. **データベースのセットアップ**

データベースのマイグレーションを実行します：

```bash
npm run db:push
```

これにより、`chats`と`messages`テーブルがデータベースに作成されます。

5. **開発サーバーの起動**

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてアプリケーションを確認できます。

## 使い方

### 基本的な使い方

1. **APIキーの設定**
   - チャットインターフェースの設定アイコン（⚙️）をクリック
   - 使用するAIプロバイダーのAPIキーを入力
   - 「Save」をクリックして保存

2. **モデルの選択**
   - チャットインターフェース上部のモデルセレクターから使用するモデルを選択
   - 利用可能なモデル：
     - **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`
     - **Groq**: `kimi-k2`, `qwen3-32b`, `llama4`
     - **XAI**: `grok-3-mini`

3. **チャットの開始**
   - テキスト入力欄にメッセージを入力
   - Enterキーまたは送信ボタンで送信
   - AIからの応答がストリーミングで表示されます

### MCPサーバーの設定

このアプリケーションは、Model Context Protocol (MCP) サーバーに接続してツールにアクセスできます。

#### MCPサーバーの追加

1. チャットインターフェースの設定アイコン（⚙️）をクリック
2. 「MCP Servers」セクションで「Add Server」をクリック
3. サーバー名を入力
4. トランスポートタイプを選択：
   - **HTTP**: HTTPベースのリモートサーバー用
   - **SSE (Server-Sent Events)**: SSEベースのリモートサーバー用
5. サーバーURLを入力（例: `https://mcp.example.com/mcp`）
6. 「Add Server」をクリック
7. 「Enable Server」をクリックして現在のチャットセッションでサーバーを有効化

#### 利用可能なMCPサーバー例

- [Composio](https://composio.dev/mcp) - 検索、コードインタープリター、その他のツールを提供
- [Zapier MCP](https://zapier.com/mcp) - Zapierツールへのアクセスを提供
- [Hugging Face MCP](https://huggingface.co/mcp) - Hugging Face Hubへのツールアクセスを提供
- HTTPまたはSSEトランスポートと互換性のある任意のMCPサーバー

## 開発

### 利用可能なスクリプト

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# リンターの実行
npm run lint

# データベース関連
npm run db:generate  # マイグレーションファイルの生成
npm run db:migrate   # マイグレーションの実行
npm run db:push      # スキーマをデータベースに直接プッシュ
npm run db:studio    # Drizzle Studioを起動（データベースGUI）
```

### プロジェクト構造

```
mcp-client-chat/
├── app/              # Next.js App Router
│   ├── api/         # APIルート
│   └── chat/         # チャットページ
├── components/       # Reactコンポーネント
├── lib/              # ユーティリティとヘルパー
│   ├── db/          # データベース設定とスキーマ
│   └── mcp-client.ts # MCPクライアント
├── ai/               # AIプロバイダー設定
└── drizzle/          # データベースマイグレーションファイル
```

## トラブルシューティング

### データベース接続エラー

- **パスワード認証エラー**: データベースの認証情報（ユーザー名、パスワード）が正しいか確認してください
- **接続タイムアウト**: 
  - データベースがパブリックアクセスを許可しているか確認
  - セキュリティグループでポート5432が開いているか確認
  - 現在のIPアドレスからの接続が許可されているか確認

### ビルドエラー

- `.next`フォルダを削除して再ビルド: `rm -rf .next && npm run dev`
- `node_modules`を削除して再インストール: `rm -rf node_modules && npm install`

### APIキーエラー

- 環境変数またはlocalStorageにAPIキーが正しく設定されているか確認
- 使用するモデルに対応するAPIキーが設定されているか確認

## ライセンス

このプロジェクトはApache License 2.0の下でライセンスされています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 元のプロジェクト

このプロジェクトは [scira-mcp-chat](https://github.com/zaidmukaddam/scira-mcp-chat) をベースにしています。

## 貢献

プルリクエストやイシューの報告を歓迎します。大きな変更を加える場合は、まずイシューを開いて変更内容を議論してください。
