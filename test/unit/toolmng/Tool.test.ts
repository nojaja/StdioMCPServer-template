import { Tool } from '../../../src/toolmng/Tool';

class ConcreteTool extends Tool {
  public name = 'concrete';
  public title = 'Concrete';
  public description = 'concrete tool';
  public command = 'concrete';
  public inputSchema = { type: 'object' };
  public outputSchema = { type: 'object' };

  public init(params: any): Promise<any> {
    this.title = params?.title || this.title;
    return Promise.resolve();
  }
  public dispose(params: any): Promise<any> { return Promise.resolve(); }
  public async run(params: any) { return { ok: true, params }; }
}

describe('Tool base class', () => {
  // テスト内容: Tool の getMeta が期待どおりのメタ情報を返すこと
  // 想定結果: name/title/description/command/inputSchema/outputSchema が含まれる
  it('getMeta returns tool metadata', async () => {
    const t = new ConcreteTool();
    const meta = t.getMeta();
    expect(meta).toHaveProperty('name', 'concrete');
    expect(meta).toHaveProperty('title', 'Concrete');
    expect(meta).toHaveProperty('description', 'concrete tool');
    expect(meta).toHaveProperty('command', 'concrete');
    expect(meta).toHaveProperty('inputSchema');
  });

  // テスト内容: title を未定義にした場合、getMeta の title は name を使用すること
  // 想定結果: title フィールドが未定義でも getMeta().title は name と同値になる
  it('getMeta uses name when title is undefined', () => {
    class NoTitleTool extends ConcreteTool {
      public title = undefined as any;
    }
    const t2 = new NoTitleTool();
    const meta2 = t2.getMeta();
    expect(meta2.title).toBe(t2.name);
  });
});
