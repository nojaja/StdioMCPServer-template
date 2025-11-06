## StdioMCPServer-template

このリポジトリは、標準入出力（stdio）ベースの MCP（Model Context Protocol）サーバーのテンプレート実装です。
開発者が独自の「Tool」を追加して、MCP メッセージ経由でツールを実行できる構造を提供します。

## 主な目的

- MCP ツールのテンプレートとして、stdio を通したメッセージ入出力でツール実行ができる。
- Toolロジック以外の機能を提供することでtoolロジックの構築のみに集中できます。
- stdio経由でのテスト実行を行うためのサンプルを提供。

## 特徴

- ESM（import/export）ベースの実装。
- Tool をプラグイン的に追加できる `src/toolmng/Tool.ts` / `src/toolmng/ToolRegistry.ts` 構成。
- サンプルツール（`SampleTool`）が `src/tools/` に含まれる。
- Jest を用いたユニットテスト群と、E2E 用のテストディレクトリが含まれる。

## リポジトリ構成（抜粋）

- `src/` - 実装コード
  - `index.ts` - エントリ（CLI 実行など）
  - `StdioMCPServer.ts` - stdio ベースのサーバ本体
  - `Logger.ts` - Logger
  - `toolmng/Tool.ts` - Tool の抽象型（インターフェース）
  - `toolmng/ToolRegistry.ts` - Tool の登録・検索
  - `tools/SampleTool.ts` - サンプルツール（参照実装）
- `test/` - テスト
  - `unit/` - ユニットテスト
  - `e2e/mcpServer/` - E2E テスト（CLI ランナー等）

プロジェクトの完全なファイル一覧はリポジトリのルートを参照してください。

## 開発環境（想定）

- OS: Windows
- Shell: PowerShell（PowerShell 特有のコマンド書式に注意）
- Node.js: v18 系を想定
- npm を使って依存関係を管理


## セットアップ（ローカル）

依存をインストールするにはプロジェクトルートで以下を実行します（PowerShell 用記法）。

```powershell
npm install ; npm run test
```

（最初に `npm install` を行い、`npm run test` でユニットテストが実行されます）

※`package.json` のスクリプトや依存はプロジェクトによって変わる可能性があるため、必要に応じてルートの `package.json` を確認してください。

## テストの実行

- ユニットテスト: `npm run test`（Jest）
- E2E テスト: リポジトリ内の `test/e2e/` 配下を参照。E2E 実行には別途コマンドや環境が用意されている場合があります。

PowerShell での例:

```powershell
npm install ; npm run test
```

テストが失敗する場合は、出力ログを確認し、必要ならば依存の再インストールや Node.js バージョンの整合を確認してください。

## Tool の追加方法（簡易ガイド）

このプロジェクトは「Tool」を追加して機能を拡張するパターンが中心です。基本的な流れは以下の通りです。

1. `src/toolmng/Tool.ts` を参照して、新しい Tool クラスを作成します（SampleTool を参考にすると早いです）。
2. `src/tools/index.ts` にツールを export して登録します。
3. `ToolRegistry`（`src/toolmng/ToolRegistry.ts`）が起動時にツールを読み込み、実行できるようになります。
4. 必要なら `test/unit/` にユニットテスト、`test/e2e/` に E2E テストを追加します。

実装のポイント:

- Tool の戻り値やメッセージ仕様はプロジェクト内の規約に従ってください（例: `{ content: [...] }` 形式など）。
- メッセージの受け渡しは stdio 経由なので、入出力のシリアライズ（JSON 等）に注意してください。

## 貢献方法

- 新しい Tool の追加、既存 Tool の改良、テストの追加は歓迎です。
- 変更を加える場合はユニットテストを追加して動作を検証してください（Jest の ESM/Babel 指針に従うこと）。
