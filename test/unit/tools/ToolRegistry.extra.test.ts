import { ToolRegistry } from '../../../src/toolmng/ToolRegistry';

describe('ToolRegistry extra operations', () => {
  // テスト内容: register が init を呼び出し、get/unregister が期待通り動作すること
  // 想定結果: init が呼ばれ、get で取得でき、unregister 後は取得できなくなる
  it('register calls init and unregister removes tool', async () => {
    const registry = ToolRegistry.getInstance();

    const spyInit = jest.fn().mockResolvedValue(undefined);
    const spyRun = jest.fn().mockResolvedValue({ ok: true });
    const mockTool: any = {
      name: 'mocker',
      title: 'mocker',
      description: 'mock',
      command: 'mocker',
      inputSchema: {},
      outputSchema: {},
      init: spyInit,
      dispose: jest.fn(),
      run: spyRun
    };

    // register should return tool
    const returned = registry.register(mockTool);
    expect(returned).toBe(mockTool);

    // init should have been called (or caught) - mocked to resolve
    expect(spyInit).toHaveBeenCalled();

    // get should return the tool
    const got = registry.get('mocker');
    expect(got).toBeDefined();

    // execute should call run and return value
    const res = await registry.execute('mocker', { x: 1 });
    expect(spyRun).toHaveBeenCalledWith({ x: 1 });
    expect(res).toEqual({ ok: true });

    // unregister should remove the tool
    const removed = registry.unregister('mocker');
    expect(removed).toBe(true);
    expect(registry.get('mocker')).toBeUndefined();
  });

  // テスト内容: getInstance のシングルトン動作（既存インスタンスを返す）を検証
  // 想定結果: 複数回の getInstance 呼び出しで同一インスタンスを返す
  it('getInstance returns singleton', () => {
    const a = ToolRegistry.getInstance();
    const b = ToolRegistry.getInstance();
    expect(a).toBe(b);
  });

  // テスト内容: init を持たないツールを登録した場合のコードパスを検証
  // 想定結果: init が無くても register は正常に登録される
  it('register works when init is not a function', () => {
    const registry = ToolRegistry.getInstance();
    const minimal: any = {
      name: 'minimal',
      title: 'minimal',
      description: 'min',
      command: 'min',
      inputSchema: {},
      outputSchema: {},
      // no init
      dispose: jest.fn(),
      run: jest.fn().mockResolvedValue({ ok: true })
    };
    expect(() => registry.register(minimal)).not.toThrow();
    // cleanup
    registry.unregister('minimal');
  });
});
