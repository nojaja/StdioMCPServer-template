import { ToolRegistry } from '../toolmng/ToolRegistry';
import { SampleTool } from './SampleTool';

const toolRegistry = ToolRegistry.getInstance();
// register built-in tools
const sampleInstance = toolRegistry.register(new SampleTool());

export const instance = sampleInstance;