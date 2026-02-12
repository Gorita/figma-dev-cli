---
name: figma
description: Interact with Figma designs via CLI. Use when (1) extracting code from Figma designs, (2) inspecting Figma node hierarchy, (3) taking Figma screenshots, (4) querying design tokens/variables, (5) managing code-design mappings, (6) generating design system rules, (7) working with FigJam boards. Requires Figma Desktop running with Dev Mode enabled.
---

# Figma CLI Skill

Interact with Figma Desktop's MCP server through `figma-dev` CLI commands. Always use `--json` for structured, parseable output.

## Prerequisites

Figma Desktop must be running with Dev Mode enabled. The CLI connects to `http://127.0.0.1:3845/mcp`.

## CLI Binary

```
figma-dev
```

Install: `npm install -g figma-dev-cli`

## Core Workflow

### 1. Explore Design Structure

```bash
figma-dev --json inspect [nodeId]
```

Omit `nodeId` to use the currently selected node in Figma. Returns XML tree with node IDs, names, types, and sizes. Use this first to discover node IDs.

### 2. Extract Code from Node

```bash
figma-dev --json extract [nodeId] [--force-code]
```

Returns generated code (React component) and asset URLs. Use `--force-code` for large nodes.

### 3. Capture Screenshot

```bash
figma-dev --json shot [nodeId] [-o output.png]
```

Saves PNG screenshot. Default filename: `<nodeId>.png` or `selection.png`.

### 4. Query Design Tokens

```bash
figma-dev --json tokens [nodeId]
```

Returns colors, fonts, effects, spacings as key-value pairs.

## Output Format

All `--json` responses follow:

```json
// Success
{ "status": "success", "data": { ... }, "metadata": { "nodeId": "52:590" } }

// Error
{ "status": "error", "error": { "code": "CONNECTION_ERROR", "message": "..." } }
```

File-producing commands (shot) return `{ "status": "success", "outputFile": "...", "outputSize": "37.2KB" }`.

## Additional Commands

For `connect`, `design-rules`, `figjam` details, see [references/cli-commands.md](references/cli-commands.md).
