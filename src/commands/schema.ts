import type { Command, Option, Argument } from 'commander';

export interface SchemaArg {
  name: string;
  required: boolean;
  description: string;
}

export interface SchemaOption {
  name: string;
  required: boolean;
  description: string;
  flags: string;
}

export interface CommandSchema {
  command: string;
  description: string;
  args: SchemaArg[];
  options: SchemaOption[];
  subcommands?: CommandSchema[];
}

export interface SchemaListItem {
  command: string;
  description: string;
}

function extractArgs(cmd: Command): SchemaArg[] {
  return (cmd as unknown as { _args: Argument[] })._args.map((arg) => ({
    name: arg.name(),
    required: arg.required,
    description: arg.description,
  }));
}

function extractOptions(cmd: Command): SchemaOption[] {
  return cmd.options
    .filter((opt: Option) => !['json', 'version', 'help'].includes(opt.long?.replace('--', '') ?? ''))
    .map((opt: Option) => ({
      name: opt.long?.replace('--', '') ?? opt.short?.replace('-', '') ?? '',
      required: opt.mandatory,
      description: opt.description,
      flags: opt.flags,
    }));
}

function buildCommandSchema(cmd: Command): CommandSchema {
  const subs = cmd.commands;
  const schema: CommandSchema = {
    command: cmd.name(),
    description: cmd.description(),
    args: extractArgs(cmd),
    options: extractOptions(cmd),
  };

  if (subs.length > 0) {
    schema.subcommands = subs.map(buildCommandSchema);
  }

  return schema;
}

/**
 * 특정 명령어의 스키마를 반환한다.
 * 존재하지 않으면 null.
 */
export function buildSchema(program: Command, commandName: string): CommandSchema | null {
  const cmd = program.commands.find((c) => c.name() === commandName);
  if (!cmd) return null;
  return buildCommandSchema(cmd);
}

/**
 * 모든 명령어의 이름과 설명을 반환한다.
 */
export function buildSchemaList(program: Command): SchemaListItem[] {
  return program.commands
    .filter((cmd) => cmd.name() !== 'help')
    .map((cmd) => ({
      command: cmd.name(),
      description: cmd.description(),
    }));
}
