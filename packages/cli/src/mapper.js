function mapRootNodeToIR(root) {
  return root.instructions.map((instr) => {
    const args = (instr.args || []).map((a) => ({
      name: a.name,
      uiType: mapTypeToUi(a.type),
      required: !a.optional,
      docs: a.docs
    }));
    
    const accounts = (instr.accounts || []).map((ac) => ({
      name: ac.name,
      isSigner: !!ac.isSigner,
      isWritable: !!ac.isMut || !!ac.isWritable,
      optional: !!ac.optional,
      docs: ac.docs
    }));
    
    return {
      name: instr.name,
      args,
      accounts,
      docs: instr.docs ? instr.docs.join('\n') : ''
    };
  });
}

function mapTypeToUi(type) {
  if (!type) return 'Text';
  
  if (typeof type === 'string') {
    switch (type) {
      case 'publicKey':
      case 'pubkey':
        return 'Address';
      case 'string':
        return 'Text';
      case 'bool':
        return 'Toggle';
      case 'u8':
      case 'u16':
      case 'u32':
      case 'i8':
      case 'i16':
      case 'i32':
        return 'Number';
      case 'u64':
      case 'u128':
      case 'i64':
      case 'i128':
        return 'BigInt';
      default:
        return 'Text';
    }
  }
  
  if (typeof type === 'object') {
    if (type.option) return mapTypeToUi(type.option);
    if (type.vec) return 'List';
    if (type.defined) return 'Text';
    if (type.array) return 'List';
  }
  
  return 'Text';
}

module.exports = { mapRootNodeToIR, mapTypeToUi };
