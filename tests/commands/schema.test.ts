import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { buildSchema, buildSchemaList } from '../../src/commands/schema.js';
import { registerCommands } from '../../src/program.js';

function createProgram(): Command {
  const program = new Command();
  program.name('figma-dev').version('0.0.0');
  registerCommands(program);
  return program;
}

describe('buildSchemaList', () => {
  it('등록된 모든 명령어 이름을 반환', () => {
    const program = createProgram();
    const list = buildSchemaList(program);

    expect(list).toContainEqual(expect.objectContaining({ command: 'extract' }));
    expect(list).toContainEqual(expect.objectContaining({ command: 'inspect' }));
    expect(list).toContainEqual(expect.objectContaining({ command: 'shot' }));
    expect(list).toContainEqual(expect.objectContaining({ command: 'tokens' }));
    expect(list).toContainEqual(expect.objectContaining({ command: 'connect' }));
    expect(list).toContainEqual(expect.objectContaining({ command: 'design-rules' }));
    expect(list).toContainEqual(expect.objectContaining({ command: 'figjam' }));
  });

  it('각 항목에 description이 포함됨', () => {
    const program = createProgram();
    const list = buildSchemaList(program);
    const extract = list.find((s) => s.command === 'extract');

    expect(extract?.description).toBeTruthy();
  });
});

describe('buildSchema', () => {
  it('extract 명령어의 파라미터와 옵션을 반환', () => {
    const program = createProgram();
    const schema = buildSchema(program, 'extract');

    expect(schema).not.toBeNull();
    expect(schema!.command).toBe('extract');
    expect(schema!.args).toContainEqual(
      expect.objectContaining({ name: 'nodeId', required: false }),
    );
    expect(schema!.options).toContainEqual(
      expect.objectContaining({ name: 'force-code' }),
    );
    expect(schema!.options).toContainEqual(
      expect.objectContaining({ name: 'artifact-type' }),
    );
    expect(schema!.options).toContainEqual(
      expect.objectContaining({ name: 'task-type' }),
    );
  });

  it('connect 명령어의 서브커맨드를 반환', () => {
    const program = createProgram();
    const schema = buildSchema(program, 'connect');

    expect(schema).not.toBeNull();
    expect(schema!.subcommands).toBeDefined();
    expect(schema!.subcommands).toContainEqual(
      expect.objectContaining({ command: 'list' }),
    );
    expect(schema!.subcommands).toContainEqual(
      expect.objectContaining({ command: 'add' }),
    );
  });

  it('connect add의 필수 옵션이 표시됨', () => {
    const program = createProgram();
    const schema = buildSchema(program, 'connect');
    const addSub = schema!.subcommands!.find((s) => s.command === 'add');

    expect(addSub).toBeDefined();
    const sourceOpt = addSub!.options.find((o) => o.name === 'source');
    expect(sourceOpt?.required).toBe(true);
  });

  it('존재하지 않는 명령어는 null 반환', () => {
    const program = createProgram();
    const schema = buildSchema(program, 'nonexistent');

    expect(schema).toBeNull();
  });

  it('shot 명령어의 옵션에 output이 포함됨', () => {
    const program = createProgram();
    const schema = buildSchema(program, 'shot');

    expect(schema!.options).toContainEqual(
      expect.objectContaining({ name: 'output' }),
    );
  });
});
