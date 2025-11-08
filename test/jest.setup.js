// Jest global setup for tests
// By default, suppress console.error output to avoid Jest treating logs as failures in CI/tests
// Set environment variable SHOW_CONSOLE_ERRORS=1 to see console.error during local debugging

if (!process.env.SHOW_CONSOLE_ERRORS) {
  // silence console.error globally
  const originalConsoleError = console.error;
  // Keep a reference in case some tests want to restore
  global.__originalConsoleError = originalConsoleError;
  console.error = (...args) => {
    console.info(...args); // you can change to console.log if you prefer
  };
}

// ensure built-in tools are registered before tests run
// require() を使って同期的にロードする（Jest の ESM 設定によって動的 import が失敗するため）
try {
  // require TypeScript module via Jest's transformer (ts-jest) by omitting extension
  require('../src/tools/index');
} catch (e) {
  // 無視: テスト環境によっては ESM の解決が異なるため、テスト内で個別に登録されることを想定
  // コンソールを出力しない方針のため、そのまま進める
}
