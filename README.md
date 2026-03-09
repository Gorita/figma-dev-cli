# figma-dev-cli

Token-efficient CLI for Figma Desktop MCP server. Built for AI agents and developers.

Inspired by [Playwright CLI](https://github.com/microsoft/playwright-cli)'s approach — replacing MCP tool calls with token-efficient CLI commands.

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

### Field Filtering

Use `--fields` to select only needed fields, reducing token usage:

```bash
figma-dev --json --fields "texts[0]" extract 52:590    # Code only, skip guidance
figma-dev --json --fields "xml" inspect 52:590          # XML only, skip guidance
```

Supports dot notation (`definitions.primary-color`) and array indices (`texts[0]`).

## Command Introspection

Discover commands and their parameters at runtime:

```bash
figma-dev schema              # List all commands
figma-dev schema extract      # Show params, options, descriptions as JSON
```

## License

MIT
