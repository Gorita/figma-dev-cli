export interface SuccessResult {
  status: 'success';
  data: unknown;
  metadata: Record<string, unknown>;
}

export interface FileOutputResult {
  status: 'success';
  outputFile: string;
  outputSize: string;
  metadata: Record<string, unknown>;
}

export interface ErrorResult {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
}

export type JsonResult = SuccessResult | FileOutputResult | ErrorResult;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)}KB`;
}

export function formatSuccess(
  data: unknown,
  metadata: Record<string, unknown> = {},
): SuccessResult {
  return { status: 'success', data, metadata };
}

export function formatFileOutput(
  outputFile: string,
  sizeBytes: number,
  metadata: Record<string, unknown> = {},
): FileOutputResult {
  return {
    status: 'success',
    outputFile,
    outputSize: formatBytes(sizeBytes),
    metadata,
  };
}

export function formatError(code: string, message: string): ErrorResult {
  return {
    status: 'error',
    error: { code, message },
  };
}
