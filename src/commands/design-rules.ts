import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';

export async function designRulesAction(
  client: FigmaMCPClient,
): Promise<string> {
  await client.connect();
  try {
    return await client.createDesignSystemRules();
  } finally {
    await client.disconnect();
  }
}
