import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';
import type { Screenshot } from '../types/figma.js';

export interface ShotOptions {}

export async function shotAction(
  nodeId: string | undefined,
  _options: ShotOptions,
  client: FigmaMCPClient,
): Promise<Screenshot> {
  await client.connect();
  try {
    return await client.getScreenshot(nodeId);
  } finally {
    await client.disconnect();
  }
}
