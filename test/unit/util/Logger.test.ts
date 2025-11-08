import { Logger, LogLevels } from '../../../src/util/Logger';

describe('Logger basics', () => {
  // テスト内容: info は内部で log を呼び出し、コンソールに Info 表記で出力される
  // 想定結果: console に '[Info] message' と追加パラメータが渡される
  it('info should call log with Info level', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    Logger.info('hello', { a: 1 });
    expect(spy).toHaveBeenCalledWith('[Info] hello', { a: 1 });
    spy.mockRestore();
  });

  // テスト内容: error は内部で log を呼び出し、コンソールに Error 表記で出力される
  // 想定結果: console に '[Error] message' が渡される
  it('error should call log with Error level', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    Logger.error('fail', 'more');
    expect(spy).toHaveBeenCalledWith('[Error] fail', 'more');
    spy.mockRestore();
  });

  // テスト内容: debug は Logger.levels が Debug より大きければ何も出力しない
  // 想定結果: デフォルトは Info のため、debug 呼び出しでは console の呼び出しが発生しない
  it('debug should be no-op when levels > Debug', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    // デフォルトレベルを Info に設定
    Logger.levels = LogLevels.Info;
    Logger.debug('should not be logged');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  // テスト内容: debug は Logger.levels が Debug 以下なら出力される
  // 想定結果: levels を Debug に設定すると、debug 呼び出し時にコンソール出力が行われる
  it('debug should log when levels <= Debug', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    Logger.levels = LogLevels.Debug;
    Logger.debug('debugging', 123);
    expect(spy).toHaveBeenCalledWith('[Debug] debugging', 123);
    // reset
    Logger.levels = LogLevels.Info;
    spy.mockRestore();
  });
});
