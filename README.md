# figma-dev-cli

Token-efficient CLI for Figma Desktop MCP server. Built for AI agents and developers.

[한국어](README.ko.md)

## Prerequisites

- Node.js v20+
- Figma Desktop running with Dev Mode enabled
- Figma Desktop MCP server (`http://127.0.0.1:3845/mcp`)

## Install

```bash
npm install -g figma-dev-cli
figma-dev setup  # Install Claude Code skill
```

## Usage

```bash
# Inspect node hierarchy
figma-dev inspect [nodeId]

# Extract code from design
figma-dev extract [nodeId]

# Capture screenshot
figma-dev shot [nodeId]

# Query design tokens/variables
figma-dev tokens [nodeId]

# Manage code-design mappings
figma-dev connect list [nodeId]
figma-dev connect add [nodeId] --source <path> --name <name> --label <label>

# Generate design system rules
figma-dev design-rules

# Work with FigJam boards
figma-dev figjam [nodeId]
```

Omit `nodeId` to use the currently selected node in Figma Desktop.

## JSON Output

Use `--json` for structured output (recommended for AI agents):

```bash
figma-dev --json inspect 52:590
figma-dev --json extract 52:590
```

## License

MIT
