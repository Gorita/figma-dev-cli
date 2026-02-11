import type { Command } from 'commander';
import { FigmaMCPClient } from './client/FigmaMCPClient.js';
import { extractAction } from './commands/extract.js';
import { inspectAction } from './commands/inspect.js';
import { shotAction } from './commands/shot.js';
import { tokensAction } from './commands/tokens.js';
import { connectListAction, connectAddAction } from './commands/connect.js';
import { designRulesAction } from './commands/design-rules.js';
import { figjamAction } from './commands/figjam.js';

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

export function addConnectCommand(program: Command): void {
  const connect = program
    .command('connect')
    .description('코드-디자인 매핑 관리 (code_connect_map)');

  connect
    .command('list')
    .description('매핑 정보 조회')
    .argument('[nodeId]', '노드 ID (미지정 시 현재 선택 노드)')
    .action(async (nodeId: string | undefined) => {
      const client = createClient();
      const result = await connectListAction(nodeId, client);
      console.log(JSON.stringify(result.mappings, null, 2));
    });

  connect
    .command('add')
    .description('노드-코드 컴포넌트 매핑 등록')
    .option('--node-id <nodeId>', '노드 ID')
    .requiredOption('-s, --source <path>', '소스 코드 파일 경로')
    .requiredOption('-n, --name <componentName>', '컴포넌트 이름')
    .requiredOption('-l, --label <framework>', '프레임워크 라벨 (React, Vue 등)')
    .action(async (opts: { nodeId?: string; source: string; name: string; label: string }) => {
      const client = createClient();
      await connectAddAction(opts, client);
      console.log('매핑 등록 완료');
    });
}

export function addDesignRulesCommand(program: Command): void {
  program
    .command('design-rules')
    .description('디자인 시스템 규칙 생성 프롬프트 출력 (create_design_system_rules)')
    .action(async () => {
      const client = createClient();
      const result = await designRulesAction(client);
      console.log(result);
    });
}

export function addFigJamCommand(program: Command): void {
  program
    .command('figjam')
    .description('FigJam 파일 코드 생성 (get_figjam)')
    .argument('[nodeId]', '노드 ID (미지정 시 현재 선택 노드)')
    .option('--no-images', '노드 이미지 제외')
    .action(async (nodeId: string | undefined, opts: { images: boolean }) => {
      const client = createClient();
      const result = await figjamAction(nodeId, { includeImagesOfNodes: opts.images }, client);
      console.log(result.code);
    });
}

export function registerCommands(program: Command): void {
  addExtractCommand(program);
  addInspectCommand(program);
  addShotCommand(program);
  addTokensCommand(program);
  addConnectCommand(program);
  addDesignRulesCommand(program);
  addFigJamCommand(program);
}
