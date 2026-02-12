import { createRequire } from 'node:module';
import { Command } from 'commander';
import { registerCommands } from './program.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const program = new Command();

program
  .name('figma-dev')
  .description('Figma MCP CLI - Figma 디자인을 터미널에서 탐색')
  .version(version);

registerCommands(program);

program.parse();
