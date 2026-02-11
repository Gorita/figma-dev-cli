import type { Command } from 'commander';
import { FigmaMCPClient } from './client/FigmaMCPClient.js';
import { extractAction } from './commands/extract.js';
import { inspectAction } from './commands/inspect.js';
import { shotAction } from './commands/shot.js';
import { tokensAction } from './commands/tokens.js';

function createClient(): FigmaMCPClient {
  return new FigmaMCPClient();
}

export function addExtractCommand(program: Command): void {
  program
    .command('extract')
    .description('디자인 노드를 코드로 변환 (get_design_context)')
    .argument('[nodeId]', '노드 ID (미지정 시 현재 선택 노드)')
    .option('--force-code', '큰 노드에서도 코드 강제 반환')
    .action(async (nodeId: string | undefined, opts: { forceCode?: boolean }) => {
      const client = createClient();
      const result = await extractAction(nodeId, opts, client);
      console.log(JSON.stringify(result, null, 2));
    });
}

export function addInspectCommand(program: Command): void {
  program
    .command('inspect')
    .description('노드 계층 구조 조회 (get_metadata)')
    .argument('[nodeId]', '노드 ID (미지정 시 현재 선택 노드)')
    .action(async (nodeId: string | undefined) => {
      const client = createClient();
      const result = await inspectAction(nodeId, {}, client);
      console.log(result.xml);
      if (result.guidance) {
        console.error(result.guidance);
      }
    });
}

export function addShotCommand(program: Command): void {
  program
    .command('shot')
    .description('노드 스크린샷 캡처 (get_screenshot)')
    .argument('[nodeId]', '노드 ID (미지정 시 현재 선택 노드)')
    .option('-o, --output <file>', '출력 파일 경로')
    .action(async (nodeId: string | undefined, opts: { output?: string }) => {
      const client = createClient();
      const result = await shotAction(nodeId, {}, client);
      const { writeFileSync } = await import('node:fs');
      const outputPath = opts.output ?? `${nodeId?.replace(':', '-') ?? 'selection'}.png`;
      writeFileSync(outputPath, result.data);
      console.log(outputPath);
    });
}

export function addTokensCommand(program: Command): void {
  program
    .command('tokens')
    .description('디자인 토큰(변수) 조회 (get_variable_defs)')
    .argument('[nodeId]', '노드 ID (미지정 시 현재 선택 노드)')
    .action(async (nodeId: string | undefined) => {
      const client = createClient();
      const result = await tokensAction(nodeId, {}, client);
      console.log(JSON.stringify(result.definitions, null, 2));
    });
}

export function registerCommands(program: Command): void {
  addExtractCommand(program);
  addInspectCommand(program);
  addShotCommand(program);
  addTokensCommand(program);
}
