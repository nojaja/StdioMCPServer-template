## StdioMCPServer-template

This repository is a template implementation of a stdio-based MCP (Model Context Protocol) server.
It provides a structure where developers can add custom "Tools" that are executed via MCP messages sent over standard input/output.

## Main Goals

- Provide a template for MCP tools that run using message I/O over stdio.
- Offer common server and framework functionality so developers can focus on implementing tool logic.
- Supply examples and test scaffolding to help run and validate tools via stdio.

## Key Features

- Implemented using ESM (import/export) modules.
- Plugin-like Tool architecture with `src/toolmng/Tool.ts` and `src/toolmng/ToolRegistry.ts`.
- A sample tool (`SampleTool`) is included under `src/tools/` as a reference implementation.
- Unit tests (Jest) and an E2E test directory are included.

## Repository Layout (excerpt)

- `src/` - source code
	- `index.ts` - CLI entry point
	- `StdioMCPServer.ts` - stdio-based server core
	- `Logger.ts` - logger utility
	- `toolmng/Tool.ts` - Tool abstract/interface
	- `toolmng/ToolRegistry.ts` - Tool registration and lookup
	- `tools/SampleTool.ts` - sample tool implementation
- `test/` - tests
	- `unit/` - unit tests
	- `e2e/mcpServer/` - end-to-end tests (CLI runner, etc.)

For the full file tree, see the repository root.

## Development Environment (assumed)

- OS: Windows
- Shell: PowerShell (note PowerShell-specific command syntax)
- Node.js: v18.x (recommended)
- npm for dependency management

## Local Setup

Install dependencies and run tests from the project root (PowerShell example):

```powershell
npm install ; npm run test
```

Note: The exact scripts and dependencies are defined in `package.json`; confirm them if you need to change behavior.

## Running Tests

- Unit tests: `npm run test` (Jest)
- E2E tests: see `test/e2e/` — E2E execution may require additional commands or environment setup.

PowerShell example:

```powershell
npm install ; npm run test
```

If tests fail, inspect the output logs and verify your Node.js version and installed dependencies.

## Adding a Tool (quick guide)

This project is centered on adding "Tool" classes to extend behavior. Basic steps:

1. Refer to `src/toolmng/Tool.ts` and implement a new Tool class (use `SampleTool` as a reference).
2. Export the tool from `src/tools/index.ts` so it is available for registration.
3. `ToolRegistry` (in `src/toolmng/ToolRegistry.ts`) will load and register tools at startup so they can be executed.
4. Add unit tests under `test/unit/` and E2E tests under `test/e2e/` as needed.

Implementation notes:

- Follow the repository's message and response conventions (for example the `{ content: [...] }` format used in some tools).
- Because messages are passed over stdio, ensure proper serialization (JSON) and consider edge cases in parsing.

## Contributing

- Contributions are welcome: add new tools, improve existing ones, or add tests.
- When changing behavior, include unit tests to verify correctness and follow the Jest ESM/Babel guidance used in this repository.

