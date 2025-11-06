---
title: MCPサーバにツール機能を追加する手順
---

## 概要

このドキュメントは、現在の `StdioMCPServer-template` リポジトリに「ツール（Tool）機能」を追加するための手順を、日本語で順を追ってまとめたものです。対象読者はリポジトリを改修する開発者で、実装・テスト・ドキュメント更新までの一連の作業をカバーします。

## 目的と期待成果物

- サーバから呼び出せる「ツール（Tool）」の追加方法を定義する
- サンプル Tool 実装（`src/tools/SampleTool.ts` など）とそれを登録する流れを示す
- Tool 登録/呼び出しの契約（入力/出力/エラー仕様）を明示する
- ユニット/E2E テストの追加手順を提示する

## 小さな契約（Contract）

実装前に明確にする簡潔な契約（最低限）:

- 入力: { type: string, params?: Record<string, any> } の形でメッセージを受け取る
- 出力: 成功時は { ok: true, result: any }、失敗時は { ok: false, error: { message: string, code?: string } }
 - 出力: プロジェクト内の既存実装に合わせ、正式仕様は `{ content: [...] }` 形式を採用します。各ツールは以下のレスポンス形を返してください。

  ```json
  {
    "content": [
      { "type": "text", "text": "..." },
      { "type": "json", "json": { /* 任意の構造 */ } },
      { "type": "error", "error": { "message": "...", "code": "..." } }
    ]
  }
  ```

  理由: レポジトリの既存ツール（`SampleTool`）が `{ content: [...] }` を返す実装になっているため、後方互換性を保つためにこの形式を正式仕様とします。

  補足: サーバーや呼び出し側で `{ content: [...] }` を `{ ok: true/false, result/error }` に変換するアダプタを用意することを推奨します（下部に変換例を記載）。
- 例外/エラー: ツールは内部で例外を投げない。Promise を reject するか、上記失敗オブジェクトを返す
- タイムアウト: ツール実行は呼び出し側でタイムアウト可能（例: 30秒）

この契約は `src/toolmng/Tool.ts` と `src/toolmng/ToolRegistry.ts` の実装に反映してください。

正式仕様（決定）

- トップレベルはオブジェクトで `content` プロパティを持つこと。
- `content` は順序付き配列で、各要素（ContentItem）は次のいずれかの形を取る。
  - text: { type: 'text', text: string }
  - json: { type: 'json', json: any }
  - error: { type: 'error', error: { message: string, code?: string } }

この仕様により、ツールは複数のチャンク（説明文本、構造化データ、エラー情報など）を柔軟に返せます。

## 変更・追加が想定されるファイル

- `src/tools/` - 個別のツール実装を配置するディレクトリ（例: `SampleTool.ts`）
- `test/unit/...` - ユニットテストを追加
- `test/e2e/mcpServer/...` - E2E テストでツール呼び出しを確認
- `docs/add-tool-feature.md` - （このファイル）手順書
- `.github/instructions/memory-bank/*` - 重要変更は Memory Bank に追記

## 実装手順（詳細）

以下は「既存ファイルを大規模に書き換えず、最小限の追加でツール機能を実装する」ための手順です。多くのケースでは既存コードに深く手を入れずに新しいツール群を追加できます。

1) 既存インターフェースについて

  - `src/toolmng/Tool.ts` と `src/toolmng/ToolRegistry.ts` の仕様に従って作業を行います。以下は参照用の最小型定義と、実装時に意識すべき点です。

    - エクスポート形態
      - `Tool` や `ToolResult` がどのようにエクスポートされているか（named export / default export）。import パスに `.js`/`.ts` を付ける方式か確認する。
    - モジュール形式
      - プロジェクトが ESM（import/export）か CommonJS か。`package.json` の `type` を確認し、ESM なら `.js` の import で `./Tool.js` のように参照する必要がある。
    - Tool 型・シグネチャ
      - `run` のシグネチャ（引数の形、戻り値が Promise か同期待ちか）を確認する。
      - 期待する `ToolResult` の形（成功/失敗オブジェクトのスキーマ）を確認する。
    - ID と命名規約
      - `tool.id` が文字列で一意であること。既存ツールと重複しない命名規則（例: 小文字、ハイフン区切り）を確認する。
    - 登録方法（Registry）の API
      - `register` / `get` などの関数名、引数の型、例外を投げるかどうかを把握する。
      - 既存の登録タイミング（同期で登録するか、非同期初期化が必要か）を確認する。
    - 初期化フローと起動タイミング
      - サーバ起動時にどのファイルが読み込まれるか、初期化フック（init）があるか。`initTools()` をどこで呼べばよいかを特定する。
    - メッセージ仕様との整合性
      - サーバが期待するメッセージ形式（例: `type: 'tool:run'`, `toolId`, `input`）を再確認する。
      - レスポンスの送信方法（標準出力、MCP プロトコル、JSON ラップなど）を把握する。
    - エラー／例外ハンドリング
      - `run` 内で例外が投げられた場合、呼び出し側がどのように扱うか（catch してエラーレスポンスに変換する必要があるか）を確認する。
    - タイムアウト／キャンセル仕様
      - 呼び出し側でタイムアウトを扱うべきか、ツール側でキャンセル対応が必要かを確認する。
    - 同時実行性・スレッドセーフ性
      - ツールがステートフルか（内部状態を持つか）を確認し、必要なら同期制御について検討する。
    - ロギング／監査
      - 既存のロギング方針（console / logger）に合わせる。セキュリティで必須の監査情報（誰がいつ呼んだか）を出力する必要があるかを確認する。
    - パーミッションとセキュリティ制約
      - ツールがファイルやネットワークへアクセスして良いかどうか、ホワイトリストや制限がある場合はその範囲を確認する。
    - テストの期待値
      - 既存テストのスタイル（Jest + ESM + babel-jest 指針）に合わせる。ユニットテストで期待される mock 戦略やフォルダ配置を確認する。
    - 互換性とバージョニング
      - 既存ツール ID やメッセージ仕様の後方互換性を壊さないよう、バージョンポリシーがあるか確認する。
    - ファイル位置・命名
      - `src/tools/` 配下の命名規約（`*Tool.ts` のようなパターン）や拡張子の取り扱いを確認する。

  以下を参照してください。

  例（新規追加する場合の最小型定義）:

  ```js
  // src/toolmng/Tool.ts
  export type ToolResult = { ok: true; result: any } | { ok: false; error: { message: string; code?: string } };
  export type Tool = { id: string; run: (input: any) => Promise<ToolResult> };
  ```

2) ツールの追加（必須）

  - `src/tools/HogeTool.ts` を実装し、上の `Tool` 仕様に沿った `run` を実装します。
  - 例: 簡単な計算や文字列操作を行い、結果を { ok: true, result } の形で返す。
   - 例: 簡単な計算や文字列操作を行い、結果を `content` 配列の中の text/json 要素として返す。

---


具体例: `src/tools/HogeTool.ts` の作り方（詳細）

以下は `HogeTool.ts` をそのままコピーして使える参考実装です。プロジェクトのコーディング規約に合わせて `.ts`/`.js` の拡張子や import パスを調整してください。

ポイント:
- ESM の `import` / `export` を使う（既存プロジェクトに合わせる）
- `id` は一意の文字列にする（登録時のキー）
- `run` は Promise を返し、常に `ToolResult` 形式 ({ ok: true|false, result|error }) を返す
- 入力検証は早期に行い、不正入力はエラーオブジェクトで返す

参考実装:

```ts
// src/tools/HogeTool.ts
import { Tool, ToolResult } from '../toolmng/Tool.js';

const HogeTool: Tool = {
  id: 'hoge',
  /**
   * input の想定形: { action: 'calc', args: { x: number, y: number } }
   */
  async run(input): Promise<ToolResult> {
    try {
      if (!input || typeof input !== 'object') {
        return { ok: false, error: { message: 'invalid input', code: 'INVALID_INPUT' } };
      }

      if (input.action === 'calc') {
        const { args } = input;
        if (!args || typeof args.x !== 'number' || typeof args.y !== 'number') {
          return { ok: false, error: { message: 'invalid args', code: 'INVALID_ARGS' } };
        }
        const value = args.x + args.y;
        return { ok: true, result: { value } };
      }

      // 未知の action はエラーにする
      return { ok: false, error: { message: 'unknown action', code: 'UNKNOWN_ACTION' } };
    } catch (err) {
      // 内部例外はエラーレスポンスに変換して返す
      return { ok: false, error: { message: String(err), code: 'INTERNAL_ERROR' } };
    }
  }
};

export default HogeTool;
```

- テストのヒント:
- `HogeTool.run` は純粋関数に近いのでユニットテストが書きやすいです。正常系（x+y）と異常系（不正な input / args）をそれぞれ検証してください。
- E2E テストではサーバへ `type: 'tool:run'` のメッセージを送信して、上記フォーマットのレスポンスが返ることを確認します。

実装上の注意:
- 長時間実行する処理は `run` 内で直接行わず、呼び出し元でタイムアウト監視を行ってください（Promise.race など）。
- 外部リソース（ファイル/ネットワーク）へアクセスする場合は、必ずテストでモック可能な形に抽象化してください。


3) ツール登録レイヤ — 参照ファイル: `src/toolmng/ToolRegistry.ts`

  - `src/toolmng/ToolRegistry.ts` を開き、以下の最小 API を実装（または確認）してください:

  ```js
  export function register(tool) { /* 登録処理 */ }
  export function getTool(id) { /* 取得処理 */ }
  ```

4) ツール初期化エントリ — 参照ファイル: `src/tools/index.ts`

  - `src/tools/index.ts` を開き、全ツールを import して `register()` する初期化関数 `initTools()` をエクスポートしてください。実装例は次のとおりです（そのまま貼って使えます）。

  ```js
  import { register } from '../toolmng/ToolRegistry.js';
  import HogeTool from './HogeTool.js';

  export function initTools() {
    register(HogeTool);
  }
  ```

5) サーバ起動時の初期化 — 参照ファイル: `src/index.ts`

  - 起動フローに `initTools()` を一行追加してください。参照例:

  ```js
  import { initTools } from './tools/index.js';
  initTools();
  ```

6) ツール呼び出しルーティング（既存のメッセージ処理に差し込む）

  - 受信メッセージをパースする箇所（MCPメッセージ処理）で `type: 'tool:run'` のような専用 type を判定し、`getTool(toolId)` を呼んで `run()` を実行します。
  - 多くの実装では既存のメッセージディスパッチに1つの分岐を追加するだけで済みます。

  例（擬似）:

  ```js
  import { getTool } from './toolmng/ToolRegistry.js';

  async function onMessage(msg) {
    if (msg.type === 'tool:run' && msg.toolId) {
      const tool = getTool(msg.toolId);
      if (!tool) return sendError('TOOL_NOT_FOUND');
      const result = await Promise.race([tool.run(msg.input), timeout(30000)]);
      sendResponse({ type: 'tool:response', toolId: msg.toolId, ...result });
    }
    // 既存のメッセージ処理...
  }
  ```

7) テストの追加

  - ユニットテスト: `test/unit/tools/SampleTool.test.js` を作成し、正常系・異常系を検証します。`ToolRegistry` が新規作成した場合は register/get の挙動もテストします。
  - E2E: 既存の E2E フレームワーク（`test/e2e/mcpServer`）を使い、サーバ起動後に標準入出力で `tool:run` メッセージを送ってレスポンスを確認します。

8) ドキュメントと Memory Bank の更新

  - 実装後、追加・新規作成したファイルをコミットし、この `docs/add-tool-feature.md` に追記（変更点や設計メモ）します。
  - 重要な設計判断は `.github/instructions/memory-bank/progress.instructions.md` に日付付きで記録してください（プロジェクトルール）。

9) ビルド・テスト

  - 依存をインストールし、ユニット/E2E テストを実行して合格を確認します。PowerShell例:

```powershell
npm install ; npm run test ; npm run test:e2e
```

  - テストが失敗した場合は該当箇所を修正し、再試行してください。

## 作業時に参照する最小ファイルと確認手順（短縮版）

以下は作業者が実装・検証を行う際に開くべき最小ファイルと、各ファイルで必ず確認・実行すべき項目です。不要なファイルは開かず、この順で作業してください。

1) `src/toolmng/Tool.ts`
  - 確認: `Tool` / `ToolResult` の export 形（named/default）と `run` のシグネチャ
  - 実行: export 形式に合わせて `import` を書く（変更は不要なら行わない）

2) `src/toolmng/ToolRegistry.ts`
  - 確認: `register(tool)` と `getTool(id)` の関数名と挙動（同期/非同期）
  - 実行: register/get が正しく動作することを軽く確認（コンソールで登録→取得できるか）

3) `src/tools/HogeTool.ts`（実装）
  - 実行: 下記「HogeTool 実装仕様」に従って実装する。

4) `src/tools/index.ts`
  - 実行: `initTools()` が `register(HogeTool)` を呼んでいることを確認。なければ追加。

5) `src/index.ts`（起動エントリ）
  - 実行: 起動直後に `initTools()` を呼んでいることを確認。呼んでいなければ一行追加。

6) メッセージ処理箇所（例: `onMessage` を含むファイル）
  - 確認: `type: 'tool:run'` を受け取り `getTool`→`run` を呼ぶ分岐が入る場所を特定
  - 実行: 分岐が無ければ `getTool(msg.toolId)` を呼び `run(msg.input)` の結果を sendResponse するコードを追加

この順でファイルを開けば、作業に必要な参照は最小化されます。

## 決定事項: `HogeTool.ts` の実装仕様（このセッションで確定）

以下はこのセッションで決めた `HogeTool` の仕様です。実装者はこれに従ってください。

- ファイル: `src/tools/HogeTool.ts`
- export: default export（オブジェクト `HogeTool`）
- id: `'hoge'`
- import: ESM 形式で `import { Tool, ToolResult } from '../toolmng/Tool.js';`
- run シグネチャ: `async run(input): Promise<ToolResult>`
- 想定 input:
  - { action: 'calc', args: { x: number, y: number } }
- 戻り値 (`ToolResult`):
  - 成功: { ok: true, result: any }
  - 失敗: { ok: false, error: { message: string, code?: string } }
- 定義済みエラーコード:
  - INVALID_INPUT
  - INVALID_ARGS
  - UNKNOWN_ACTION
  - INTERNAL_ERROR
- 動作方針:
  - 入力検証は `run` の先頭で行う。問題があれば上記コードで失敗オブジェクトを返す。
  - 例外はキャッチして `INTERNAL_ERROR` を返す。
  - タイムアウトは呼び出し側（サーバ）が `Promise.race` 等で制御する。

参考実装（コピペして使えます）:

```js
// src/tools/HogeTool.ts
import { Tool, ToolResult } from '../toolmng/Tool.js';

const HogeTool = {
  id: 'hoge',
  async run(input) {
    try {
      if (!input || typeof input !== 'object') {
        return { ok: false, error: { message: 'invalid input', code: 'INVALID_INPUT' } };
      }
      if (input.action === 'calc') {
        const { args } = input;
        if (!args || typeof args.x !== 'number' || typeof args.y !== 'number') {
          return { ok: false, error: { message: 'invalid args', code: 'INVALID_ARGS' } };
        }
  return { content: [{ type: 'json', json: { value: args.x + args.y } }] };
      }
      return { ok: false, error: { message: 'unknown action', code: 'UNKNOWN_ACTION' } };
    } catch (e) {
      return { ok: false, error: { message: String(e), code: 'INTERNAL_ERROR' } };
    }
  }
};

export default HogeTool;
```

## 注意すべきエッジケース

- ツールの無限ループやハングを防ぐため、呼び出し側で必ずタイムアウトを設定する
- 入力が不正（null / 型不一致 / 長大なペイロード）なケースを早期に弾くバリデーションを実装する
- セキュリティ: ツール実行によるファイル/ネットワークアクセスを必要最小限に限定するか、サンドボックス化を検討する
- エラーメッセージに絶対パスやシステム情報を含めない（情報漏洩防止）

## 例: ツール呼び出しのメッセージ例

送受信フォーマット（提案）:

リクエスト:

```json
{
  "type": "tool:run",
  "toolId": "sample",
  "input": { "action": "calc", "args": { "x": 1, "y": 2 } }
}
```

  レスポンス（成功）例（正式仕様: content 配列）:

```json
{
  "type": "tool:response",
  "toolId": "sample",
  "content": [ { "type": "json", "json": { "value": 3 } } ]
}
```

レスポンス（失敗）例:

```json
{
  "type": "tool:response",
  "toolId": "sample",
  "content": [ { "type": "error", "error": { "message": "invalid args", "code": "INVALID_ARGS" } } ]
}
```

レスポンス変換の例（サーバ側でのアダプタ）:

```js
function adaptContentToOkResult(resp) {
  const err = resp.content.find(c => c.type === 'error');
  if (err) return { ok: false, error: err.error };
  const json = resp.content.find(c => c.type === 'json');
  if (json) return { ok: true, result: json.json };
  const text = resp.content.map(c => c.type === 'text' ? c.text : null).filter(Boolean).join('\n');
  return { ok: true, result: text };
}
```

## 進め方（推奨）

1. 本手順書に従ってまずドキュメントと契約を確定する
2. 小さな HogeTool を作り、ToolRegistry 経由で呼べるようにして E2E で一発通ることを目指す
3. 成功したら既存のツール群やユースケースに応じて拡張する
4. 変更点は必ず Memory Bank に追記する（重要）

## 補足・プロアクティブ事項

- 可能であれば `test/unit` に最低限の 2 件（正常系・例外系）を書いてから実装するのが速く安定します
- 実装時には `src/toolmng/Tool` の JSDoc コメントで契約を明示しておくと、後続の実装が楽になります

---

作成日: 2025-11-06
