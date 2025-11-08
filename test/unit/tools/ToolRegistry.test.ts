import { ToolRegistry } from '../../../src/toolmng/ToolRegistry';
import { SampleTool } from '../../../src/tools/SampleTool';

describe('ToolRegistry basic operations', () => {
  // テスト内容: ToolRegistry にツールを登録し、登録済みツールの一覧を取得できることを確認する
  // 想定結果: list() が配列を返し、登録したサンプルツールの name ('sample') を含む
  it('can register and list tools', async () => {
    const registry = ToolRegistry.getInstance();
    const sample = new SampleTool();

    registry.register(sample);

    const list = registry.list();
    expect(Array.isArray(list)).toBe(true);
    // names should include sample
    const names = list.map((m: any) => m.name);
    expect(names).toEqual(expect.arrayContaining(['sample']));
  });

  // テスト内容: 登録済みのツールを execute できることを確認する
  // 想定結果: 実行結果が content プロパティを持っている
  it('can execute a tool', async () => {
    const registry = ToolRegistry.getInstance();
    const res = await registry.execute('sample', { taskId: 't1' });
    expect(res).toHaveProperty('content');
  });

  // テスト内容: ツールの init が例外を投げても register が例外とならず、
  // 存在しないツールを execute した場合は 'Tool not found' を投げることを確認する
  // 想定結果: register は例外を投げない。存在しないツール実行時はエラー（Tool not found）となる
  it('register handles init throwing and execute throws when not found', async () => {
    const registry = ToolRegistry.getInstance();
    const badTool: any = {
      name: 'badtool',
      title: 'bad',
      description: 'bad',
      command: 'bad',
      inputSchema: {},
      outputSchema: {},
      init: () => { throw new Error('init fail'); },
      dispose: () => {},
      run: async () => ({ content: [{ type: 'text', text: 'ok' }] })
    };

    // registering should not throw even if init throws
    expect(() => registry.register(badTool)).not.toThrow();

    // execute unknown tool should throw
    await expect(registry.execute('no-such-tool', {})).rejects.toThrow('Tool not found');
  });
});
