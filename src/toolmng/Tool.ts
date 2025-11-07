/**
 * 処理名: ToolMeta 型
 * 処理概要: ツールの識別情報や説明、入力スキーマなどを保持するメタデータ型
 * 実装理由: レジストリや UI がツールを一覧表示・検査できるように統一的なメタ情報を持たせるため。
 */
export type ToolMeta = {
    name: string;
    description?: string;
    title?: string;
    inputSchema?: any;
    outputSchema?: any;
};

/**
 * 処理名: Tool 基底クラス
 * 処理概要: すべてのツール実装が継承する共通のベースクラス。メタ情報と依存注入インターフェース、初期化/破棄/実行の基本契約を提供します。
 * 実装理由: 共通のライフサイクルとインターフェースを規定することで、ToolRegistry 等から一貫した扱いが可能になり、テストや拡張が容易になります。
 */
export abstract class Tool {
    /** ツール名（識別子） */
    public abstract name: string;
    /** ツールタイトル（表示用） */
    public abstract title?: string | undefined;
    /** ツール説明 */
    public abstract description: string;
    /** CLIでのコマンドに利用 */
    public abstract command?: string | undefined;
    /** 入力スキーマ json-schema.orgに準拠、type、descriptionは必須、必要に応じてrequiredも設定すること*/
    public abstract inputSchema: object;
    /** 出力スキーマ json-schema.orgに準拠、type、descriptionは必須 */
    public abstract outputSchema?: object | undefined;

    /**
     * 処理名: コンストラクタ
     * 処理概要: メタ情報をセットし、依存オブジェクトを初期化します。
     * 実装理由: サブクラスがメタを渡せるようにしつつ、deps を空オブジェクトで初期化して安全に扱えるようにします。
     */
    constructor() {
    }

    /**
     * 処理名: init
     * 処理概要: 依存注入を受け取り、内部 state を初期化します。
     * 実装理由: テスト時や起動時に外部リソースを注入してツールの動作に必要な環境を整えるため。
     */
    public abstract init(params: any): Promise<any>;

    /**
     * 処理名: dispose
     * 処理概要: ツールが保持するリソースを解放するためのフック
     * 実装理由: ファイルハンドルや DB 接続などのクリーンアップを行うためにサブクラスでオーバーライドできるように提供します。
     */
    public abstract dispose(params: any): Promise<any>;

    /**
     * 処理名: ツールの実行インターフェース
     * 処理概要: ツールの主処理を実行する抽象メソッド（サブクラスで実装）
     * 実装理由: ツール固有の処理ロジックはサブクラスで提供させ、ToolRegistry から統一的に呼び出せるようにするため。
     * @param {any} params 実行引数
     */
    public abstract run(params: any): Promise<any>;

    
    /**
     * 処理名: getMeta
     * 処理概要: ツールのメタ情報を返します。
     * 実装理由: レジストリや UI がツール情報を取得できるようにするため。
     * @returns {ToolMeta} ツールメタ情報
     */
    public getMeta(): ToolMeta {
        return { 
            name: this.name, 
            title: this.title ? this.title : this.name,
            description: this.description,
            inputSchema: this.inputSchema
        }
    }
}
