#!/usr/bin/env node
import { Command } from 'commander';
import { Logger, LogLevels } from './util/Logger';
import { ToolRegistry } from './toolmng/ToolRegistry';
import { StdioMCPServer } from './StdioMCPServer';
import { instance } from './tools';
import { ResultUtil } from './util/ResultUtil';

const program = new Command();

program
    .name('MCPServer')
    .description('MCP 対応ツール')
    .option('-d, --debug', 'enable debug logging')
    .version('0.1.0');


/**
 *
 */
async function main() {

    // Create a global registry instance for tools
    const toolRegistry = ToolRegistry.getInstance();

    // 動的コマンド登録: ToolRegistry に登録されている各ツールの inputSchema と command を基に
    // program に command を追加します。処理はヘルパー関数に分割して認知的複雑度を下げる
    await registerDynamicCommands(program, toolRegistry);

    // stdio サーバー起動コマンド
    program
        .command('stdio')
        .description('start the MCP server in stdio mode')
        .action(async () => {
            try {
                Logger.levels = program.opts().debug ? LogLevels.Debug : LogLevels.Info;
                //console.errorでPIDを返す
                Logger.debug('[MCP Server] Starting stdio MCP server... PID:', process.pid);

                // register built-in tools explicitly (dynamic loading disabled)
                const instance = new StdioMCPServer();
                instance.sendNotification({
                    "jsonrpc": "2.0",
                    "method": "notifications/tools/list_changed"
                });//ツールの更新を通知

                instance.sendNotification({
                    "jsonrpc": "2.0",
                    "method": "notifications/initialized"
                });//初期化完了を通知


            } catch (error) {
                Logger.error('[MCP Server] Failed to start server:', error);
                process.exit(1);
            }
        });

    program.parse(process.argv);
    Logger.debug('[MCP Server] Registering built-in tools...', instance);
    try {
        Logger.debug('[MCP Server] Built-in tools registered:', toolRegistry.list().map(t => t.name));
    } catch (err) {
        Logger.error('[MCP Server] Failed to register built-in tools:', err);
    }

}



/**
 * 指定された properties 情報をもとに commander のコマンドへ option を登録する
 * @param cmd 登録対象の Command
 * @param properties inputSchema.properties に相当するオブジェクト
 * @param required 必須プロパティ名の配列
 */
function addOptionsToCommand(cmd: Command, properties: any, required: string[]) {
    for (const propName of Object.keys(properties)) {
        const prop: any = properties[propName] || {};
        const short = prop.short ? String(prop.short) : String(propName).charAt(0);
        const type = prop.type ? String(prop.type) : 'string';
        // boolean は引数を取らないフラグ、その他は値を取る形式とする
        const argPart = type === 'boolean' ? '' : ` <${propName}>`;
        const flags = `-${short}, --${propName}${argPart}`;
        const desc = prop.description || '';

        if (required.includes(propName)) {
            // 必須は requiredOption として登録
            (cmd as any).requiredOption(flags, desc);
        } else {
            (cmd as any).option(flags, desc);
        }
    }
}

/**
 * ToolRegistry に登録されたツールから program にコマンドを登録する（分離された処理）
 * @param program Commander の program インスタンス
 * @param toolRegistry ツールのレジストリ
 */
async function registerDynamicCommands(program: Command, toolRegistry: ToolRegistry) {
    try {
        const metas = toolRegistry.list();
        for (const meta of metas) {
            registerCommandForMeta(meta as any, program, toolRegistry);
        }
    } catch (e) {
        Logger.error('[MCP Server] Dynamic tool command registration failed:', e);
    }
}

/**
 * 単一のツールメタ情報から Command を生成して program に登録する
 * @param meta ツールのメタ情報
 * @param program Commander の program インスタンス
 * @param toolRegistry ツールのレジストリ
 */
function registerCommandForMeta(meta: any, program: Command, toolRegistry: ToolRegistry) {
    try {
        const commandName = meta.command || meta.name
        const description = meta.description || meta.title || meta.name;

        const cmd = program.command(commandName).description(description as string);

        const schema = meta.inputSchema || {};
        const properties = schema.properties || {};
        const required = Array.isArray(schema.required) ? schema.required : [];

        // options 登録は別関数に切り出す
        addOptionsToCommand(cmd, properties, required as string[]);

        // アクションはツール名で ToolRegistry.execute を呼ぶ
        cmd.action(async (...args: any[]) => {

            Logger.levels = program.opts().debug ? LogLevels.Debug : LogLevels.Info;
            //console.errorでPIDを返す
            Logger.debug('[MCP Server] Starting stdio MCP server... PID:', process.pid);

            // commander の仕様で最後の引数が Command オブジェクト / options となる
            const opts = args[args.length - 1] || {};
            try {
                const result = await toolRegistry.execute(meta.name as string, opts.opts());
                ResultUtil.printResult(result);
            } catch (e) {
                Logger.error('[MCP Server] Tool execution failed:', e);
                // CLI 実行なので失敗時は非0で終了
                process.exit(1);
            }
        });

    } catch (e) {
        Logger.error('[MCP Server] Failed to register command for tool:', meta.name, e);
    }
}

main();
