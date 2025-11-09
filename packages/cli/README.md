# CastUI CLI

The CastUI CLI generates UI scaffolding from Anchor IDLs. This document covers how to work with the CLI locally and how to publish it.

## Local Development

- Direct run:
  ```bash
  node packages/cli/bin/castui.js
  ```
- `npm link` to test globally:
  ```bash
  cd packages/cli
  npm link
  castui
  npm unlink -g @castui/cli
  ```
- Smoke test script:
  ```bash
  yarn workspace @castui/cli run test:smoke
  ```

## Packaging & NPX Usage

- Create a tarball:
  ```bash
  cd packages/cli
  npm pack
  ```
- Install tarball in another project:
  ```bash
  npm install ../path/to/@castui-cli-*.tgz
  ```
- Run via GitHub shorthand:
  ```bash
  npx github:owner/castui
  ```

## Publishing

- Ensure version and publish config are set in `packages/cli/package.json`.
- Authenticate with npm: `npm login`.
- Publish:
  ```bash
  cd packages/cli
  npm publish --access public
  ```
- Tag release:
  ```bash
  git tag v0.1.0
  git push origin --tags
  ```

