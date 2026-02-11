import type { FigmaMCPClient } from '../client/FigmaMCPClient.js';
import type { CodeConnectMap } from '../types/figma.js';

export async function connectListAction(
  nodeId: string | undefined,
  client: FigmaMCPClient,
): Promise<CodeConnectMap> {
  await client.connect();
  try {
    return await client.getCodeConnectMap(nodeId);
  } finally {
    await client.disconnect();
  }
}

export interface ConnectAddOptions {
  nodeId?: string;
  source: string;
  name: string;
  label: string;
}

export async function connectAddAction(
  options: ConnectAddOptions,
  client: FigmaMCPClient,
): Promise<void> {
  await client.connect();
  try {
    await client.addCodeConnectMap({
      nodeId: options.nodeId,
      source: options.source,
      componentName: options.name,
      label: options.label,
    });
  } finally {
    await client.disconnect();
  }
}
