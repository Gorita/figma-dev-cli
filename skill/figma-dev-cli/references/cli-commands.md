# figma-dev CLI Commands Reference

All commands support `--json` for structured output. Add to root command: `figma-dev --json <command>`.

Use `--fields` with `--json` to filter response fields: `figma-dev --json --fields "texts[0]" extract`.

## Table of Contents

- [extract](#extract) - Design node to code
- [inspect](#inspect) - Node hierarchy (XML)
- [shot](#shot) - Screenshot capture
- [tokens](#tokens) - Design tokens/variables
- [connect list](#connect-list) / [connect add](#connect-add) - Code-design mappings
- [design-rules](#design-rules) - Design system rules prompt
- [figjam](#figjam) - FigJam board to code
- [schema](#schema) - Command introspection
- [--fields](#fields-filter) - Response field filtering
- [Error Response](#error-response)

## extract

Convert Figma design node to code.

```bash
figma-dev --json extract [nodeId] [--force-code] [--artifact-type <type>] [--task-type <type>]
```

- `nodeId`: Node ID (e.g., `52:590`). Omit to use current Figma selection.
- `--force-code`: Force code generation even for large nodes.
- `--artifact-type`: `WEB_PAGE_OR_APP_SCREEN`, `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN`, `REUSABLE_COMPONENT`, `DESIGN_SYSTEM`
- `--task-type`: `CREATE_ARTIFACT`, `CHANGE_ARTIFACT`, `DELETE_ARTIFACT`

**JSON output**: `{ status, data: { texts: [string, ...] }, metadata: { nodeId } }`

The `data.texts` array contains MCP server responses: first element is typically generated code, remaining elements are guidance/context. Asset URLs appear inline as `http://localhost:3845/assets/<hash>.svg`.

## inspect

Get node hierarchy as XML tree. Lightweight exploration.

```bash
figma-dev --json inspect [nodeId]
```

**JSON output**: `{ status, data: { xml, guidance }, metadata: { nodeId } }`

The `xml` field contains a tree like:
```xml
<frame id="52:590" name="Page" width="360" height="989">
  <instance id="52:591" name="StatusBar" width="360" height="47" />
</frame>
```

Use `inspect` first to discover node IDs, then `extract` for specific nodes.

## shot

Capture screenshot of a node and save to file.

```bash
figma-dev --json shot [nodeId] [-o, --output <file>]
```

- `-o, --output <file>`: Output file path. Default: OS temp directory (`/tmp/figma-<nodeId>.png`).

**JSON output**: `{ status, outputFile, outputSize, metadata: { nodeId } }`

The screenshot is saved as PNG to the OS temp directory by default. The `outputFile` path is in the JSON response. Delete the file after reading.

## tokens

Get design tokens (variables): colors, fonts, effects, spacings.

```bash
figma-dev --json tokens [nodeId]
```

**JSON output**: `{ status, data: { "Text color/normal": "#0C1120", ... }, metadata: { nodeId } }`

Token format examples:
- Color: `"#2D91FF"`
- Font: `"Font(family: \"Pretendard\", style: SemiBold, size: 16, ...)"`
- Shadow: `"Effect(type: DROP_SHADOW, color: #0000001A, ...)"`

## connect list

Get code-design component mappings.

```bash
figma-dev --json connect list [nodeId]
```

**JSON output**: `{ status, data: { mappings }, metadata: { nodeId } }`

## connect add

Register a code-design component mapping.

```bash
figma-dev --json connect add [--node-id <id>] -s <source> -n <name> -l <label>
```

Required options:
- `-s, --source <path>`: Source code file path
- `-n, --name <componentName>`: Component name
- `-l, --label <framework>`: Framework label (React, Vue, SwiftUI, Flutter, etc.)

## design-rules

Generate a prompt for creating design system rules documentation.

```bash
figma-dev --json design-rules
```

Returns a structured prompt to analyze the codebase for design system conventions.

## figjam

Generate code from a FigJam board.

```bash
figma-dev --json figjam [nodeId] [--no-images]
```

- `--no-images`: Exclude node images from response.

**JSON output**: `{ status, data: { code }, metadata: { nodeId } }`

## schema

Discover commands and their parameters at runtime. No MCP connection needed.

```bash
figma-dev schema              # List all commands with descriptions
figma-dev schema extract      # Show extract's args, options, descriptions
figma-dev schema connect      # Show subcommands (list, add) with their options
```

**Output** (schema extract):
```json
{
  "command": "extract",
  "description": "디자인 노드를 코드로 변환 (get_design_context)",
  "args": [{ "name": "nodeId", "required": false, "description": "..." }],
  "options": [{ "name": "force-code", "required": false, "flags": "--force-code" }, ...]
}
```

## --fields filter

Filter JSON response to include only specified fields. Reduces token usage.

```bash
figma-dev --json --fields "texts[0]" extract [nodeId]
figma-dev --json --fields "xml" inspect [nodeId]
figma-dev --json --fields "primary-color,font-size" tokens [nodeId]
```

Path syntax:
- Simple key: `xml`, `code`
- Array index: `texts[0]`, `[1]`
- Nested: `definitions.primary-color`
- Combined: `items[0].name`

Without `--fields`, returns full `data` object. With `--fields`, `data` contains only the requested fields.

## Error Response

All commands return this structure on error:

```json
{ "status": "error", "error": { "code": "CONNECTION_ERROR", "message": "..." } }
```

Error codes: `CONNECTION_ERROR`, `TOOL_EXECUTION_ERROR`, `SESSION_ERROR`, `UNKNOWN_ERROR`.

Exit code is 1 on error.

## Prerequisites

- Figma Desktop app must be running with Dev Mode enabled
- MCP server runs at `http://127.0.0.1:3845/mcp`
- Node.js v20+
