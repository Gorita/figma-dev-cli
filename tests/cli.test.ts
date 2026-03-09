import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };
const bin = resolve(__dirname, '..', 'bin', 'figma-dev.js');

describe('figma-dev CLI', () => {
  it('--help 출력', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('Figma MCP CLI');
    expect(output).toContain('figma-dev');
  });

  it('--version 출력', () => {
    const output = execFileSync('node', [bin, '--version'], { encoding: 'utf-8' });
    expect(output.trim()).toBe(version);
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

  it('--fields 옵션이 help에 표시됨', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('--fields');
  });

  it('schema 명령어가 help에 표시됨', () => {
    const output = execFileSync('node', [bin, '--help'], { encoding: 'utf-8' });
    expect(output).toContain('schema');
  });

  it('schema 인자 없이 실행하면 전체 명령어 목록 출력', () => {
    const output = execFileSync('node', [bin, 'schema'], { encoding: 'utf-8' });
    const list = JSON.parse(output) as Array<{ command: string }>;
    const commands = list.map((item) => item.command);
    expect(commands).toContain('extract');
    expect(commands).toContain('inspect');
    expect(commands).toContain('shot');
  });

  it('schema extract 실행하면 파라미터/옵션 스키마 출력', () => {
    const output = execFileSync('node', [bin, 'schema', 'extract'], { encoding: 'utf-8' });
    const schema = JSON.parse(output) as { command: string; args: unknown[]; options: unknown[] };
    expect(schema.command).toBe('extract');
    expect(schema.args.length).toBeGreaterThan(0);
    expect(schema.options.length).toBeGreaterThan(0);
  });

  it('schema 존재하지 않는 명령어 시 에러', () => {
    try {
      execFileSync('node', [bin, 'schema', 'nonexistent'], { encoding: 'utf-8', stdio: 'pipe' });
      expect.unreachable('에러가 발생해야 함');
    } catch (error: unknown) {
      const err = error as { stderr: string; status: number };
      expect(err.stderr).toContain('찾을 수 없습니다');
    }
  });
});
