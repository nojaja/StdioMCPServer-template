import { ToolRegistry } from '../../../src/toolmng/ToolRegistry';
import { SampleTool } from '../../../src/tools/SampleTool';

describe('ToolRegistry basic operations', () => {
  it('can register and list tools', async () => {
    const registry = ToolRegistry.getInstance();
    const sample = new SampleTool();

    registry.register(sample);

    const list = registry.list();
    expect(Array.isArray(list)).toBe(true);
    // names should include sample and echo
    const names = list.map((m: any) => m.name);
    expect(names).toEqual(expect.arrayContaining(['sample', 'echo']));
  });

  it('can execute a tool', async () => {
    const registry = ToolRegistry.getInstance();
    const res = await registry.execute('sample', { taskId: 't1' });
    expect(res).toHaveProperty('content');
  });
});
