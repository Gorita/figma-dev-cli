import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';
import type { DesignContext } from '../types/figma.js';

export interface ExtractOptions {
  forceCode?: boolean;
  artifactType?: string;
  taskType?: string;
}

export async function extractAction(
  nodeId: string | undefined,
  options: ExtractOptions,
  client: FigmaMCPClient,
): Promise<DesignContext> {
  await client.connect();
  try {
    return await client.extractDesign(nodeId, options);
  } finally {
    await client.disconnect();
  }
}
