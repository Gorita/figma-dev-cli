import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';
import type { FigJamContext, GetFigJamParams } from '../types/figma.js';

export interface FigJamOptions {
  includeImagesOfNodes?: boolean;
}

export async function figjamAction(
  nodeId: string | undefined,
  options: FigJamOptions,
  client: FigmaMCPClient,
): Promise<FigJamContext> {
  await client.connect();
  try {
    return await client.getFigJam(nodeId, options);
  } finally {
    await client.disconnect();
  }
}
