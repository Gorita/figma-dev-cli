import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';
import type { NodeMetadata } from '../types/figma.js';

export interface InspectOptions {}

export async function inspectAction(
  nodeId: string | undefined,
  _options: InspectOptions,
  client: FigmaMCPClient,
): Promise<NodeMetadata> {
  await client.connect();
  try {
    return await client.getMetadata(nodeId);
  } finally {
    await client.disconnect();
  }
}
