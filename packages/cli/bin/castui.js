#!/usr/bin/env node

const { Command } = require('commander');
const chalkImport = require('chalk');
const chalk = chalkImport.default || chalkImport;
const path = require('path');
const fs = require('fs-extra');

const program = new Command();

program
  .name('castui')
  .description('CastUI - Anchor IDL to UI Generator')
  .version('0.1.0')
  .option('-i, --idl <path>', 'Path to Anchor IDL JSON file')
  .option('-o, --out <dir>', 'Output directory', './anchor-ui')
  .option('--template <name>', 'Template to use (shadcn | basic)', 'shadcn')
  .option('--network <net>', 'Network (devnet | testnet | mainnet)', 'devnet')
  .option('--no-install', 'Skip automatic npm install')
  .option('--auto-llm', 'Automatically apply LLM suggestions', false)
  .option('--llm-review', 'Enable LLM review mode', false)
  .action(async (options) => {
    console.log(chalk.cyan.bold('\n🎨 CastUI - Anchor IDL to UI Generator\n'));

    if (!process.argv.slice(2).length) {
      console.log(chalk.yellow('Welcome to CastUI!'));
      console.log(chalk.white('\nUsage: castui --idl <path> --out <dir> [options]'));
      console.log(chalk.white('\nRun "castui --help" for more information.\n'));
      process.exit(0);
    }

    if (!options.idl) {
      console.error(chalk.red('❌ Error: --idl flag is required'));
      console.log(chalk.white('\nUsage: castui --idl <path> --out <dir>\n'));
      process.exit(1);
    }

    const idlPath = path.resolve(options.idl);

    if (!fs.existsSync(idlPath)) {
      console.error(chalk.red(`❌ Error: IDL file not found: ${idlPath}`));
      process.exit(1);
    }

    console.log(chalk.white('📄 IDL file:'), chalk.green(idlPath));
    console.log(chalk.white('📁 Output directory:'), chalk.green(options.out));
    console.log(chalk.white('🎨 Template:'), chalk.green(options.template));
    console.log(chalk.white('🌐 Network:'), chalk.green(options.network));

    try {
      const { generate } = require('../src/generate');
      await generate(idlPath, options.out, options);
      console.log(chalk.green.bold('\n✅ UI generated successfully!\n'));
      console.log(chalk.white('Next steps:'));
      console.log(chalk.cyan(`  cd ${options.out}`));
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Error generating UI:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
