import type { Tool } from './Tool';

/**
 * 処理名: ToolRegistry クラス
 * 処理概要: ツール（Tool）インスタンスの登録・解除・取得・実行、および動的ロードと依存注入を管理するレジストリ機能を提供します。
 * 実装理由: アプリケーション側で個別のツール実装を意識せずに一元的に操作できるようにするため。ツールの管理と初期化、依存注入の適用を集中させ保守性を高めます。
 * @class
 */
export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();
    // シングルトンインスタンス
    private static _instance: ToolRegistry | null = null;

    /**
     * 処理名: コンストラクタ
     * 処理概要: 内部のツールマップと依存オブジェクトを初期化します。
     * 実装理由: ToolRegistry の基本状態（空のマップと空の依存オブジェクト）を確実に用意するため。
     * private コンストラクタにより外部での new を防ぎ、シングルトンを強制する
     */
    private constructor() {
    }

    /**
     * getInstance
     * シングルトンのインスタンスを返します。未作成の場合は生成します。
     * @returns {ToolRegistry} ToolRegistryのシングルトンインスタンス
     */
    public static getInstance(): ToolRegistry {
        if (!ToolRegistry._instance) {
            ToolRegistry._instance = new ToolRegistry();
        }
        return ToolRegistry._instance;
    }

    /**
     * 処理名: register
     * 処理概要: Tool インスタンスをレジストリに登録し、必要であれば初期化（init）を呼び出します。
     * 実装理由: 登録と同時に依存注入を適用してツールを使用可能な状態にすることで、呼び出し側の責務を軽減します。
     * @param {Tool} tool 登録するツールインスタンス
     * @returns {Tool} 登録されたツールインスタンス
     */
    public register(tool: Tool) {
        // ツールを登録マップに格納
        this.tools.set(tool.name, tool);
        try {
            // 初期化が提供されている場合は依存を渡して呼び出す
            if (typeof (tool as any).init === 'function') {
                (tool as any).init();
            }
        } catch (err) {
            // 初期化失敗はログに記録するが、登録自体は継続
            console.error('[ToolRegistry] tool.init failed for', tool.name, err);
        }
        return tool;
    }

    /**
     * 処理名: unregister
     * 処理概要: 指定した名前のツールをレジストリから削除します。
     * 実装理由: ランタイムで不要になったツールを解放・削除できるようにし、競合や不要なリソース保持を防ぐため。
     * @param {string} name ツール名
     * @returns {boolean} 削除に成功したか
     */
    public unregister(name: string) {
        return this.tools.delete(name);
    }

    /**
     * 処理名: get
     * 処理概要: 名前に対応するツールインスタンスを返します。
     * 実装理由: 外部からツールを直接取得して特定の機能を呼び出せるようにするため。
     * @param {string} name ツール名
     * @returns {Tool | undefined} ツールインスタンスまたは undefined
     */
    public get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * 処理名: list
     * 処理概要: 登録済みツールのメタ情報一覧を配列で返します。
     * 実装理由: 外部が利用可能なツール一覧（メタ情報）を取得して UI 表示や自動化に利用できるようにするため。
     * @returns {Array<any>} メタ情報配列
     */
    public list() {
        return Array.from(this.tools.values()).map(t => t.getMeta());
    }

    /**
     * 処理名: execute
     * 処理概要: 指定したツールを実行し、その実行結果を返却する非同期メソッドです。
     * 実装理由: ツール呼び出しを統一的に扱い、存在確認や例外伝搬などを一元管理するため。
     * @param {string} name ツール名
     * @param {any} args 実行引数
     * @returns {Promise<any>} ツールの実行結果
     */
    public async execute(name: string, args: any) {
        const tool = this.get(name);
        // ツール存在チェック: 存在しない場合はエラーにする（呼び出し側で処理）
        if (!tool) throw new Error(`Tool not found: ${name}`);
        return tool.run(args);
    }

}
