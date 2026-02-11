import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';
import type { VariableDefs } from '../types/figma.js';

export interface TokensOptions {}

export async function tokensAction(
  nodeId: string | undefined,
  _options: TokensOptions,
  client: FigmaMCPClient,
): Promise<VariableDefs> {
  await client.connect();
  try {
    return await client.getVariableDefs(nodeId);
  } finally {
    await client.disconnect();
  }
}
