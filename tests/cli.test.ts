import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = resolve(__dirname, '..', 'bin', 'figma-dev.js');

describe('figma-dev CLI', () => {
  it('--help 출력', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('Figma MCP CLI');
    expect(output).toContain('figma-dev');
  });

  it('--version 출력', () => {
    const output = execFileSync('node', [bin, '--version'], { encoding: 'utf-8' });
    expect(output.trim()).toBe('0.1.0');
  });

  it('서브커맨드가 help에 표시됨', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('extract');
    expect(output).toContain('inspect');
    expect(output).toContain('shot');
    expect(output).toContain('tokens');
    expect(output).toContain('connect');
    expect(output).toContain('design-rules');
    expect(output).toContain('figjam');
  });

  it('extract --help 출력', () => {
    const output = execFileSync('node', [bin, 'extract', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('nodeId');
    expect(output).toContain('--force-code');
    expect(output).toContain('--artifact-type');
    expect(output).toContain('--task-type');
  });

  it('inspect --help 출력', () => {
    const output = execFileSync('node', [bin, 'inspect', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('nodeId');
  });

  it('shot --help 출력', () => {
    const output = execFileSync('node', [bin, 'shot', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('nodeId');
    expect(output).toContain('--output');
  });

  it('tokens --help 출력', () => {
    const output = execFileSync('node', [bin, 'tokens', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('nodeId');
  });

  it('connect list --help 출력', () => {
    const output = execFileSync('node', [bin, 'connect', 'list', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('nodeId');
  });

  it('connect add --help 출력', () => {
    const output = execFileSync('node', [bin, 'connect', 'add', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('--source');
    expect(output).toContain('--name');
    expect(output).toContain('--label');
  });

  it('design-rules --help 출력', () => {
    const output = execFileSync('node', [bin, 'design-rules', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('디자인 시스템');
  });

  it('figjam --help 출력', () => {
    const output = execFileSync('node', [bin, 'figjam', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('nodeId');
    expect(output).toContain('--no-images');
  });

  it('setup --help 출력', () => {
    const output = execFileSync('node', [bin, 'setup', '--help'], { encoding: 'utf-8' });
    expect(output).toContain('스킬 설치');
  });

  it('--json 옵션이 help에 표시됨', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('--json');
  });
});
