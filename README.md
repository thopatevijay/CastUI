# CastUI

**Anchor IDL → UI Generator**

> A CLI-first tool that reads an Anchor IDL and scaffolds an editable Next.js + TypeScript frontend with wallet integration, forms for instructions, and basic account viewers.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Technical Overview](#technical-overview)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Contributing & Roadmap](#contributing--roadmap)
- [License](#license)

---

## Features

### Core Capabilities

- ✅ **IDL Parsing** - Parse Anchor IDL and normalize into an Intermediate Representation (IR)
- ✅ **Next.js Scaffold** - Generate complete Next.js + TypeScript app scaffold wired to Anchor/Codama client
- ✅ **Typed Forms** - Per-instruction forms with typed controls (pubkey, numeric, bool, string, vec)
- ✅ **Account Management** - Account viewer pages and PDA derivation helpers
- ✅ **Wallet Integration** - Seamless integration via `@solana/wallet-adapter` (Phantom support)
- ✅ **Transaction Safety** - Preflight modal showing accounts, signers, and estimated fees
- ✅ **LLM Suggestions** - Optional LLM adapter for UX suggestions (labels/placeholders/grouping) with manual approval

### CLI Features

- Simple command-line interface: `npx castui --idl <path> --out <dir>`
- Supports `--no-install` flag for manual dependency management
- Optional `--auto-llm` flag for automatic UX suggestions

---

## Quick Start

Generate a UI from your Anchor IDL in three simple steps:

```bash
# 1) Build your Anchor program to produce the IDL
cd path/to/anchor-program
anchor build

# 2) Generate the UI
npx castui \
  --idl target/idl/<your_program>.json \
  --out ./anchor-ui/<your_program>

# 3) Start the generated app
cd ./anchor-ui/<your_program>
yarn install    # or `npm install` (if you used --no-install, run this manually)
yarn dev

# Open http://localhost:3000
```

> **Note:** The generated UI app will be located in `./anchor-ui/<program-name>` by default.

---

## Installation

CastUI is distributed via npm and can be run directly without installation:

```bash
npx castui --idl <path> --out <dir>
```

Alternatively, install globally:

```bash
npm install -g castui
# or
yarn global add castui
```

---

## Usage

### CLI Options

```bash
npx castui [options]

Options:
  -i, --idl <path>      Path to Anchor IDL JSON 
                        (default: ./target/idl/program.json)
  -o, --out <dir>       Output directory 
                        (default: ./anchor-ui)
  --no-install          Do not run package manager install after generation
  --template <name>     Template/theme to use (shadcn | basic)
  --network <net>       Network: devnet | testnet | mainnet 
                        (default: devnet)
  --auto-llm            Automatically apply LLM suggestions 
                        (default: false)
  -h, --help            Display help information
```

### Examples

```bash
# Basic usage with default options
npx castui --idl target/idl/my_program.json

# Custom output directory
npx castui --idl target/idl/my_program.json --out ./my-custom-ui

# Generate for mainnet
npx castui --idl target/idl/my_program.json --network mainnet

# Skip automatic installation
npx castui --idl target/idl/my_program.json --no-install

# Use shadcn template
npx castui --idl target/idl/my_program.json --template shadcn
```

---

## Architecture

### System Overview

CastUI follows a modular architecture with clear separation of concerns:

```
┌─────────────┐
│     CLI     │  ← Orchestrates generation flow and options
└──────┬──────┘
       │
┌──────▼──────────┐
│    Parser       │  ← Codama adapter produces normalized AST/IR
└──────┬──────────┘
       │
┌──────▼──────────┐
│   IR Mapper     │  ← Converts IDL types/accounts → UI-friendly IR
└──────┬──────────┘
       │
┌──────▼──────────┐
│   Renderer      │  ← EJS/ts-morph templates generate Next.js files
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Generated App   │  ← Next.js + TypeScript with wallet adapter
└─────────────────┘
```

### Key Components

- **CLI** (Commander) - Orchestrates generation flow and handles user options
- **Parser** (Codama adapter) - Produces a normalized AST/IR from Anchor IDL
- **IR Mapper** - Converts IDL types/accounts to UI-friendly `TypeIR` and `InstructionIR`
- **Renderer** (EJS / ts-morph) - Fills templates to generate Next.js app files
- **Generated App** - Next.js + TypeScript with wallet adapter, instruction pages, PDA helpers

---

## Technical Overview

### Intermediate Representation (IR)

**What is IR?**

The Intermediate Representation (IR) is a normalized, program-agnostic schema derived from the Anchor IDL. It abstracts out type differences and exposes a simple mapping for templates:

- `pubkey` → `AddressInput`
- `u64` → `BigIntNumber`
- `bool` → `CheckboxInput`
- `string` → `TextInput`
- `vec<T>` → `ArrayInput`

This abstraction allows the renderer to generate consistent UI components regardless of the underlying Anchor program structure.

### Parsing & Rendering Pipeline

The generation process follows these steps:

1. **Load IDL** - Read Anchor IDL from `target/idl/*.json`
2. **Parse with Codama** - Convert IDL to RootNode, then map RootNode → IR
3. **Map IR → Render Context** - Transform IR into pages, components, and helpers
4. **Render Files** - Use EJS or ts-morph templates to generate Next.js app files
5. **LLM Suggestions** (Optional) - Offer UX metadata suggestions (labels/placeholders) with manual approval

### Protocol POC Requirements

- ✅ CLI accepts IDL and outputs a runnable Next.js app
- ✅ Wallet integration works (Phantom)

---

## Project Structure

```
CastUI/
├── docs/                    # Documentation files
│   ├── Project_Proposal.pdf
│   ├── User_Stories.pdf
│   ├── system_context.svg
│   ├── component_diagram.svg
│   └── sequence_flow.svg
├── packages/
│   └── generator/           # CLI package
├── templates/               # EJS templates for pages and components
└── README.md
```

---

## Documentation

### Project Proposal

**Summary:** CastUI is a CLI-first developer tool that reads an Anchor IDL and scaffolds a runnable, editable Next.js + TypeScript frontend. The generated UI integrates with wallet-adapter (Phantom), provides typed forms for each program instruction, shows account viewers and PDA derivation helpers, and includes a safety preflight modal detailing impacted accounts and signers before any on-chain invocation. Optional LLM-driven UX suggestions are available as a later-stage feature.

📄 **[View Full Project Proposal](./docs/Project_Proposal.pdf)**

### User Stories

1. **As a smart contract developer**, I want an auto-generated UI so I can quickly test my Anchor program on devnet without writing frontend code.
2. **As a frontend engineer**, I want typed clients and forms so I can easily integrate program interactions into my app.
3. **As a product manager**, I want a demoable UI for stakeholders within minutes of `anchor build`.
4. **As a security reviewer**, I want the app to surface account permissions and a preflight modal for all transactions.

📄 **[View Detailed User Stories](./docs/User_Stories.pdf)**

### Architecture Diagrams

#### System Context Diagram

High-level system boundaries and external actors.

![System Context Diagram](./docs/System%20Context%20Diagram.svg)

#### Component Diagram

Internal component structure and relationships.

![Component Diagram](./docs/Component%20Diagram.svg)

#### Sequence Flow Diagram

Interaction flow between components.

![Sequence Flow Diagram](./docs/Sequence%20Flow%20Diagram.svg)

---

## Development

### Prerequisites

- Node.js 18+ and npm/yarn
- Anchor CLI installed
- Basic understanding of Anchor programs and IDL

### Setup

```bash
# Clone the repository
git clone https://github.com/thopatevijay/TURBIN3-Q4-25.git
cd CastUI

# Install dependencies
yarn install

# Development mode
yarn dev
```

### Project Organization

- `packages/generator/` - Contains the CLI implementation
- `templates/` - EJS templates for pages and components
- Uses `yarn workspace` or monorepo layout for development

### Building

```bash
yarn build
```

---

## Contributing & Roadmap

We welcome contributions! Please see our contributing guidelines for more details.

### Planned Features

- 🔌 **Plugin Hooks** - Add plugin hooks for custom renderers
- 📚 **Storybook Generation** - Generate Storybook stories for components
- 🧪 **Testing** - Add Playwright tests for generated UIs
- 🤖 **LLM Adapter** - Enhanced LLM adapter with review UI
- 🎨 **Additional Templates** - More UI templates and themes
- 📊 **Analytics** - Usage analytics and telemetry

---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

**Discord:** `thopate_vijay`

---

*Made with ❤️ for the Solana ecosystem*
