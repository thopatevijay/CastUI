const fs = require('fs-extra');

async function parseIdlToRootNode(idlPath) {
  const raw = await fs.readFile(idlPath, 'utf8');
  const idl = JSON.parse(raw);
  
  if (!idl.instructions) {
    throw new Error('Invalid IDL: missing instructions array');
  }
  
  return {
    name: idl.name || 'unknown_program',
    version: idl.version || '0.1.0',
    metadata: idl.metadata || {},
    address: idl.metadata?.address || idl.address,
    instructions: idl.instructions.map(instr => ({
      name: instr.name,
      docs: instr.docs,
      accounts: instr.accounts || [],
      args: instr.args || []
    })),
    accounts: idl.accounts || [],
    types: idl.types || [],
    errors: idl.errors || []
  };
}

module.exports = { parseIdlToRootNode };
