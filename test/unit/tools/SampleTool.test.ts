import { SampleTool } from '../../../src/tools/SampleTool';

describe('SampleTool behavior', () => {
  // テスト内容: SampleTool.run が適切な形のレスポンスを返すこと
  // 想定結果: content 配列を持ち、中に text を含むオブジェクトがある
  it('run returns content with Hello, MCP!', async () => {
    const s = new SampleTool();
    const res = await s.run({});
    expect(res).toHaveProperty('content');
    expect(Array.isArray(res.content)).toBe(true);
    const item = res.content[0];
    expect(item).toHaveProperty('type', 'text');
    expect(item.text).toContain('Hello, MCP!');
  });

  // テスト内容: init と dispose は Promise を返して解決される（no-op）
  // 想定結果: reject されずに解決する
  it('init and dispose resolve', async () => {
    const s = new SampleTool();
    await expect(s.init({})).resolves.toBeUndefined();
    await expect(s.dispose({})).resolves.toBeUndefined();
  });
});
