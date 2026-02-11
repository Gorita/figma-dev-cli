import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = resolve(__dirname, '..', 'bin', 'figma.js');

describe('figma CLI', () => {
  it('--help 출력', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('Figma MCP CLI');
    expect(output).toContain('figma');
  });

  it('--version 출력', () => {
    const output = execFileSync('node', [bin, '--version'], { encoding: 'utf-8' });
    expect(output.trim()).toBe('0.1.0');
  });
});
