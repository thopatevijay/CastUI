# CastUI

**Anchor IDL → UI Generator**

_A CLI-first tool that reads an Anchor IDL and scaffolds an editable Next.js + TypeScript frontend with wallet integration, instruction forms, PDA helpers and account viewers._

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage & CLI Options](#usage)
- [Technical Overview](#technical-overview)
  - [Pipeline Overview](#pipeline-overview)
  - [Intermediate Representation (IR)](#intermediate-representation-ir)
- [Project Structure](#project-structure)
- [Templates & Styling](#templates--styling)
- [Generated App Layout](#generated-app-layout)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Protocol POC Requirements (short)](#protocol-poc-requirements-short)
- [Development & Testing](#development)
- [Contributing & Roadmap](#contributing--roadmap)
- [License & Contact](#license)
---

## Features

### Core Capabilities

- ✅ Parse Anchor IDL (via Codama adapter) → normalize to IR.
- ✅ Deterministic mapping from IDL types → UI controls (address, number, toggle, list, enum, file, nested structs).
- ✅ Generate runnable Next.js + TypeScript apps wired to Anchor/`@solana/web3.js`.
- ✅ Wallet integration using `@solana/wallet-adapter` (Phantom + common adapters).
- ✅ PDA derivation helpers and preflight confirmation modal (accounts, signers, fee estimate).
- ✅ Templateable UI: default `shadcn` (Tailwind + shadcn wrappers) + `basic` (vanilla CSS) option.
- ✅ Optional LLM-based UX suggestions (opt-in; manual review required).


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
npx @castui/cli --idl target/idl/<your_program>.json --out ./anchor-ui/<your_program> --template shadcn --network devnet

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
npx @castui/cli --idl <path> --out <dir>
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
npx @castui/cli --idl <path> --out <dir> [options]

Options:
   -i, --idl <path>      Path to Anchor IDL JSON (default: ./target/idl/program.json)
   -o, --out <dir>       Output directory (default: ./anchor-ui)
   --template <name>     Template/theme (shadcn | basic) (default: shadcn)
   --network <net>       Network: devnet | testnet | mainnet (default: devnet)
   --no-install          Do not run package manager install after generation
   --auto-llm            Automatically apply LLM suggestions (opt-in; default: false)
   --llm-review          Open review step for LLM suggestions (opt-in)
   -h, --help            Display help

```

### Examples

```bash
# Basic usage with default options
npx @castui/cli --idl target/idl/my_program.json

# Custom output directory
npx @castui/cli --idl target/idl/my_program.json --out ./my-custom-ui

# Generate for mainnet
npx @castui/cli --idl target/idl/my_program.json --network mainnet

# Skip automatic installation
npx @castui/cli --idl target/idl/my_program.json --no-install

# Use shadcn template
npx @castui/cli --idl target/idl/my_program.json --template shadcn
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

### Pipeline Overview

High-level flow:

```
IDL JSON -> Parser (Codama) -> RootNode (AST) -> IR Mapper -> IR
     IR -> Mapping Rules (type->ui) -> Render Context -> Renderer (EJS / ts-morph)
     Renderer -> Write Next.js app files -> Generated App (wallet provider, pages, lib)

```

**Components**

-   **CLI** (`@castui/cli`) — entrypoint, arg parsing, orchestration.
    
-   **Parser** — `@codama/nodes-from-anchor` adapter converts Anchor IDL → canonical AST.
    
-   **IR Mapper** — normalizes AST → `InstructionIR`, `ArgIR`, `AccountIR`.
    
-   **Mapping Rules Engine** — deterministic rules map IR types → UI control descriptors.
    
-   **Renderer** — EJS templates (fast MVP) or `ts-morph` (advanced) generate files.
    
-   **Generated App** — Next.js app with `_app.tsx` containing wallet adapter; pages/instruction provide forms; `lib/pdaHelpers.ts` exposes PDA functions.
    

### Intermediate Representation (IR)

**IR** is the normalized JSON model used by renderers. It hides Anchor/IDL quirks and exposes a predictable schema to template code:

Example IR fragment:

```json
{
  "instruction": "create_order",
  "args": [
    { "name": "price", "uiType": "BigIntNumber", "required": true, "hint": "lamports" },
    { "name": "metadata", "uiType": "String", "required": false }
  ],
  "accounts": [
    { "name": "payer", "role": "signer", "writable": true },
    { "name": "order_account", "role": "pda", "seeds": [["orders"], ["user_pub"]] }
  ],
  "docs": "Creates an order..."
}

```

**IR Purpose**

-   Normalize IDL differences.
    
-   Abstract types to UI controls (`pubkey -> AddressInput`, `u64 -> BigIntNumber`).
    
-   Include derived metadata: signer/writable flags, PDA seeds, validators.
    
-   Keep parser and renderer decoupled.
    
---

## Templates & Styling

**Default templates**:

-   `templates/shadcn/` — Tailwind CSS + shadcn wrappers (recommended).
    
-   `templates/basic/` — simple CSS / CSS modules.
    

**shadcn template includes**:

-   `tailwind.config.js`, `postcss.config.js`
    
-   Small `components/FormControls` wrappers for `Input`, `Select`, `Switch`, `Button`.
    
-   A `ui/` index exposing primitives used in generated pages.
    

**How styling is generated**

-   Generator copies the chosen template into the `out` directory and injects pages/components based on IR.
    
-   For `shadcn`, generated project includes Tailwind + shadcn setup so developer runs `yarn install` then `yarn dev`.
    
----------


## Project Structure

```
CastUI/
├── docs/                    # Proposal, user stories, docs & diagrams
├── packages/
│   └── cli/                 # CLI implementation -> @castui/cli
├── templates/
│   ├── shadcn/              # Tailwind + shadcn templates
│   └── basic/               # Basic CSS templates
├── tests/
│   └── fixtures/            # sample IDL fixtures
├── designs/                 # SVG diagrams (system/component/sequence)
├── issues.json              # bulk issue import (optional)
└── README.md

```

---

## Generated App Layout

Typical files produced:

```
anchor-ui/<program>/
  package.json
  next.config.js
  tsconfig.json
  tailwind.config.js (if template requires)
  pages/
    _app.tsx        <- WalletProvider (wallet adapter wiring)
    index.tsx
    instruction/<name>.tsx
  lib/
    anchorClient.ts <- Provider & Program setup
    pdaHelpers.ts   <- derived PDA helpers
  components/
    FormControls/*
    ConfirmModal.tsx
  public/
  .castui/metadata.json

```

**Runtime**

-   `_app.tsx` sets up `ConnectionProvider` and `WalletProvider`.
    
-   Pages use generated Anchor/Codama client or `@project-serum/anchor` to call program methods.
    
-   Preflight modal shows accounts/signers and fee estimate before submitting.
    
----

## Protocol POC Requirements (short)

1.  CLI accepts an Anchor IDL JSON and outputs a runnable Next.js project.
    
2.  Generated app includes wallet integration (Phantom) and an instruction page for at least one instruction.
    
3.  PDA derivation helpers generated for known seed patterns.
    
4.  Preflight modal lists accounts & signers and requires confirmation.
    
5.  Generated project includes `.castui/metadata.json` (IDL hash, timestamp).
    
6.  No private keys are committed by default (`.gitignore` includes wallet files).

----    

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

**Prereqs**

-   Node.js 18+, Yarn or npm, Anchor CLI for building IDLs.
    

**Local dev flow**

1.  `git clone https://github.com/thopatevijay/CastUI.git`.
    
2.  Implement features in `packages/cli` and templates in `templates/`.
    
3.  Quick smoke: `node packages/cli/bin/castui.js`.
    
4.  Link locally: `cd packages/cli && npm link` → `castui --help`.
    

**Tests**

-   Unit tests (Jest): parser & mapper logic.
    
-   Integration tests: generate a project into a temp dir and assert files exist; optionally run `next build`.
    
-   E2E tests (Playwright): optional heavier tests for generated apps.
    

**CI**

-   PRs run unit tests.
    
-   Tag pushes trigger publish workflow (if configured).
    
-   Integration tests optional/gated to avoid heavy CI runs.
    


---

## Contributing & Roadmap

We welcome contributions! Please see our contributing guidelines for more details.

**Short-term roadmap**

-   v0.1.0: Publish `@castui/cli` hello command.
    
-   v0.2.0: Parser + IR mapper + one-instruction generator + shadcn template.
    
-   v0.3.x: Preflight modal, PDA helpers, tests & CI.
    
-   Optional: LLM adapter + human review UI (opt-in).
    
---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

**Discord:** `thopate_vijay`

---

*Made with ❤️ for the Solana ecosystem*
