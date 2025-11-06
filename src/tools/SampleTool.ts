import { Tool } from '../toolmng/Tool';

/**
 * Sample ツール
 * @class
 */
export class SampleTool extends Tool {
    public name = 'sample';
    public title = 'Sample Tool';
    public description = 'mcp sample';
    public command = 'sample';
    public inputSchema = {
        type: 'object',
        properties: {}
    };
    public outputSchema = {
        type: 'object',
        properties: {}
    };
    /**
     * コンストラクタ
     */
    constructor() {
        super();
    }

    /**
     * 処理名: run (サンプル処理)
     * 処理概要: mcpツールのサンプル実装、これを基に新規ツールを作成してください。
     * @param args ツール引数 (taskId)
     * @returns {Promise<any>} ツールレスポンス
     */
    async run(args: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ message: 'Hello, MCP!' }, null, 2) }] };
    }


    /**
     * 処理名: init (初期化)
     * 処理概要: 依存注入オブジェクトを受け取って初期化する（現状 no-op）
     * 実装理由: 将来的な DI 対応やテスト時の依存差し替えに備えたエントリポイントとして用意
     * @param params
     * @returns {Promise<void>}
     */
    public init(params: any): Promise<any> {
        return Promise.resolve();
    }

    /**
     * 処理名: dispose (クリーンアップ)
     * 処理概要: ツールが保持するリソースを解放するためのフック（現状 no-op）
     * 実装理由: ファイルハンドルや DB 接続などのクリーンアップを行うためにサブクラスでオーバーライドできるように提供
     * @param params
     * @returns {Promise<void>}
     */
    public dispose(params: any): Promise<any> {
        return Promise.resolve();
    }
}

