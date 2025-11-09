#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const distGeneratePath = path.resolve(__dirname, '../dist/generate.js');

let generate;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ generate } = require(distGeneratePath));
} catch (error) {
  console.error(
    'Unable to load compiled CLI sources. Please run "yarn workspace @castui/cli run build" first.'
  );
  process.exit(1);
}

const program = new Command();

program
  .name('castui')
  .description('CastUI CLI')
  .option('--idl <path>', 'path to anchor idl json')
  .option('--out <dir>', 'output dir', './anchor-ui')
  .option('--template <name>', 'template name', 'shadcn')
  .option('--network <net>', 'devnet|testnet|mainnet', 'devnet')
  .option('--no-install', 'skip install')
  .option('--auto-llm', 'apply llm suggestions automatically', false)
  .allowExcessArguments(false)
  .action(async (opts) => {
    const userArgs = process.argv.slice(2);

    if (userArgs.length === 0) {
      console.log('Welcome to CastUI');
      return;
    }

    if (!opts.idl) {
      console.error('Error: --idl <path> is required when providing options.');
      process.exitCode = 1;
      return;
    }

    const idlPath = path.resolve(process.cwd(), opts.idl);
    if (!fs.existsSync(idlPath)) {
      console.error(`Error: IDL file not found at ${idlPath}`);
      process.exitCode = 1;
      return;
    }

    if (!['devnet', 'testnet', 'mainnet'].includes(opts.network)) {
      console.error("Error: --network must be one of 'devnet', 'testnet', or 'mainnet'.");
      process.exitCode = 1;
      return;
    }

    try {
      await generate(idlPath, path.resolve(opts.out), {
        template: opts.template,
        programId: undefined,
        noInstall: opts.install === false
      });
      console.log('Generation complete:', opts.out);
    } catch (error) {
      console.error('Generation failed:', error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch((err) => {
  if (err.code === 'commander.unknownOption') {
    console.error(err.message);
    process.exit(1);
  } else {
    console.error(err);
    process.exit(1);
  }
});

