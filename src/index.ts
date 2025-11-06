#!/usr/bin/env node
import { Command } from 'commander';
import { ToolRegistry } from './toolmng/ToolRegistry';
import { StdioMCPServer } from './StdioMCPServer';
import { instance } from './tools';
//console.errorでPIDを返す
console.error('[MCP Server] Starting stdio MCP server... PID:', process.pid);

const program = new Command();

program
    .name('MCPServer')
    .description('MCP 対応ツール')
    .version('0.1.0');

program
    .command('read <path> [jsonPath]')
    .option('-d, --debug', 'output extra debugging')
    .requiredOption('-c, --config <type>', 'config file path')
    .description('read markdown and output JSON (calls markdown-read)')
    .action(async (...args) => {

        console.log(...args, program.opts());
        process.exit(0);
    });

program
    .command('patch <path> <patchFile>')
    .description('apply json-patch to markdown (calls markdown-patch)')
    .action(async (path: string, patchFile: string) => {
        console.log(program.opts());
        process.exit(0);
    });

/**
 *
 */
async function main() {

    // Create a global registry instance for tools
    const toolRegistry = ToolRegistry.getInstance();
    console.error('[MCP Server] Registering built-in tools...', instance);
    try {
        console.error('[MCP Server] Built-in tools registered:', toolRegistry.list().map(t => t.name));
    } catch (err) {
        console.error('[MCP Server] Failed to register built-in tools:', err);
    }


    program
        .command('stdio')
        .description('start the MCP server in stdio mode')
        .action(async () => {
            try {
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
                console.error('[MCP Server] Failed to start server:', error);
                process.exit(1);
            }
        });

    program.parse(process.argv);
    //   program.parse(process.argv);
    //   const opts = program.opts();

}

main();
