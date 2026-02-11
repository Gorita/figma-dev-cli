# figma-cli - 프로젝트 원칙

## 프로젝트 목적

- Figma Desktop MCP 서버(figma-dev-mcp)와 상호작용하는 Node.js 기반 CLI 도구 개발. AI 에이전트와 개발자 모두를 위한 토큰 효율적인 '스킬' 인터페이스 제공.

## 진행 원칙

- 작업 전 계획 수립: 이전 개발일지(`../개발일지-figma-cli.md`)의 회고 부분을 먼저 확인하고, 그 교훈을 반영하여 계획과 TODO를 작성한다
- TDD 기반 개발: 테스트를 먼저 작성하고, 테스트를 통과시키는 코드를 구현한다
- 테스트 가능한 단위로 작업하기: 각 단계가 끝나면 로컬에서 직접 실행/확인할 수 있어야 한다
- 테스트 통과 후 커밋: 모든 테스트가 통과하고 작업이 마무리되면 커밋한다
- 커밋 전 개발일지 작성: 작업 마무리 시 `../개발일지-figma-cli.md`에 다음 내용을 기록한다
  - 작업 과정에서 새로 알게된 사실
  - 서브에이전트를 통해서 별도로 작업한 내용들 (없으면 없다고 명시)
  - 짧은 회고
  - 서브에이전트로 실행했으면 더 좋았을 업무 (병렬 처리, 탐색 등)
- 개발일지 작성 후 문서 업데이트: CLAUDE.md, 설계문서 등 기존 문서에 반영할 내용이 있는지 확인하고 업데이트한다
- 한국어로 문서, 주석, 커밋 메시지 작성

## 서브에이전트 활용 가이드

- 사전 조사는 Explore 에이전트에 병렬로 맡기면 효과적 (예: MCP SDK API 탐색, Playwright CLI 구조 분석)
- 독립적인 테스트 파일은 병렬 작성 가능
- .gitignore, tsconfig.json 같은 보조 파일도 병렬 처리 가능
- MCP 서버 연결 테스트와 CLI 파싱 테스트는 독립적이므로 병렬 가능

## 기술 스택

- **런타임**: Node.js (v20+)
- **언어**: TypeScript (strict mode)
- **CLI 프레임워크**: commander.js
- **MCP 통신**: @modelcontextprotocol/sdk (Client, StreamableHTTPClientTransport)
- **데이터 검증**: zod
- **터미널 UX**: chalk, ora
- **테스트**: vitest
- **빌드**: tsc

## 주요 문서

- `설계문서.md` - 전체 아키텍처 및 상세 설계
- `../개발일지-figma-cli.md` - 각 단계별 작업 기록 (커밋 전 작성, 상위 폴더)
- `진행상황.md` - 현재 진행 상태, 다음 할 일, 핵심 설계 요약

## 프로젝트 구조

```
figma-cli/
├── bin/
│   └── figma.js              # 실행 진입점 (shebang)
├── src/
│   ├── cli.ts                # Commander.js 메인 프로그램
│   ├── program.ts            # 명령어 등록 (addExtractCommand 등)
│   ├── client/               # MCP 통신 서비스 계층
│   │   ├── FigmaMCPClient.ts
│   │   ├── transports.ts
│   │   └── session.ts
│   ├── commands/             # 명령어별 핸들러
│   │   ├── extract.ts
│   │   ├── inspect.ts
│   │   └── screenshot.ts
│   ├── utils/
│   │   ├── config.ts
│   │   ├── formatting.ts
│   │   └── errors.ts
│   └── types/
│       └── figma.d.ts
├── tests/
├── package.json
└── tsconfig.json
```
