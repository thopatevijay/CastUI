#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

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
  .action((opts) => {
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

    console.log('Options:', {
      idl: idlPath,
      out: opts.out,
      template: opts.template,
      network: opts.network,
      install: opts.install,
      autoLlm: opts.autoLlm
    });
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

