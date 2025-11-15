const fs = require('fs-extra');
const path = require('path');
const { parseIdlToRootNode } = require('./parser');
const { mapRootNodeToIR } = require('./mapper');
const { renderToDir } = require('./renderer');
const chalk = require('chalk');

async function generate(idlPath, outDir, options) {
  console.log(chalk.blue('\n📖 Parsing IDL...'));
  const root = await parseIdlToRootNode(idlPath);
  
  console.log(chalk.blue('🔄 Mapping to IR...'));
  const instructions = mapRootNodeToIR(root);
  
  console.log(chalk.blue('✨ Rendering UI...'));
  const programName = root.name || 'my_program';
  const programId = root.metadata?.address || root.address || 'YourProgramIdHere';
  
  await renderToDir(
    { instructions, programName, programId },
    outDir,
    options
  );
  
  const metadataPath = path.join(outDir, '.castui', 'metadata.json');
  await fs.outputJSON(metadataPath, {
    idlPath: path.relative(process.cwd(), idlPath),
    programName,
    programId,
    template: options.template,
    network: options.network,
    generatedAt: new Date().toISOString(),
    version: '0.1.0'
  }, { spaces: 2 });
  
  console.log(chalk.gray(`📝 Metadata written to ${metadataPath}`));
}

module.exports = { generate };
