import { Command } from 'commander';

const program = new Command();

program
  .name('figma')
  .description('Figma MCP CLI - Figma 디자인을 터미널에서 탐색')
  .version('0.1.0');

program.parse();
