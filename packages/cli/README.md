# @castui/cli

CastUI CLI - Anchor IDL to UI Generator

## Installation

```bash
npm install -g @castui/cli
```

Or run directly with npx:

```bash
npx @castui/cli --idl path/to/idl.json --out ./output
```

## Usage

```bash
castui --idl <path> --out <dir> [options]
```

### Options

- `-i, --idl <path>` - Path to Anchor IDL JSON (required)
- `-o, --out <dir>` - Output directory (default: ./anchor-ui)
- `--template <name>` - Template to use: shadcn | basic (default: shadcn)
- `--network <net>` - Network: devnet | testnet | mainnet (default: devnet)
- `--no-install` - Skip automatic npm install
- `--auto-llm` - Automatically apply LLM suggestions (opt-in)
- `--llm-review` - Enable LLM review mode (opt-in)
- `-h, --help` - Display help

### Examples

```bash
# Basic usage
castui --idl ./target/idl/my_program.json

# Custom output directory
castui --idl ./idl.json --out ./my-ui

# Generate for mainnet
castui --idl ./idl.json --network mainnet

# Skip install
castui --idl ./idl.json --no-install
```

## Local Development

```bash
# Direct run
node ./bin/castui.js --idl path/to/idl.json

# Link globally
npm link
castui --help

# Unlink
npm unlink -g @castui/cli
```

## Generated App Structure

```
output/
├── pages/
│   ├── _app.tsx              # Wallet provider setup
│   ├── index.tsx             # Home page
│   └── instruction/          # Instruction pages
│       └── <name>.tsx
├── lib/
│   ├── anchorClient.ts       # Anchor client setup
│   └── pdaHelpers.ts         # PDA derivation helpers
├── components/               # UI components
├── styles/                   # Global styles
├── package.json
├── next.config.js
├── tsconfig.json
└── .castui/
    └── metadata.json         # Generation metadata
```

## License

MIT
