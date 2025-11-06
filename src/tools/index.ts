import { ToolRegistry } from '../toolmng/ToolRegistry';
import { SampleTool } from './SampleTool';

const toolRegistry = ToolRegistry.getInstance();
export const instance = toolRegistry.register(new SampleTool());