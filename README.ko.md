# figma-dev-cli

Figma Desktop MCP 서버를 위한 토큰 효율적 CLI. AI 에이전트와 개발자를 위해 제작.

[English](README.md)

## 사전 요구사항

- Node.js v20+
- Figma Desktop 실행 중 (Dev Mode 활성화)
- Figma Desktop MCP 서버 (`http://127.0.0.1:3845/mcp`)

## 설치

```bash
npm install -g figma-dev-cli
figma-dev setup  # Claude Code 스킬 설치
```

## 사용법

```bash
# 노드 구조 탐색
figma-dev inspect [nodeId]

# 디자인에서 코드 추출
figma-dev extract [nodeId]

# 스크린샷 촬영
figma-dev shot [nodeId]

# 디자인 토큰/변수 조회
figma-dev tokens [nodeId]

# 코드-디자인 매핑 관리
figma-dev connect list [nodeId]
figma-dev connect add [nodeId] --source <path> --name <name> --label <label>

# 디자인 시스템 규칙 생성
figma-dev design-rules

# FigJam 보드 작업
figma-dev figjam [nodeId]
```

`nodeId`를 생략하면 Figma Desktop에서 현재 선택된 노드를 사용합니다.

## JSON 출력

AI 에이전트 연동 시 `--json` 옵션으로 구조화된 출력을 받을 수 있습니다:

```bash
figma-dev --json inspect 52:590
figma-dev --json extract 52:590
```

## License

MIT
