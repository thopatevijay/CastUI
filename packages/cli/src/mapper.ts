export type UiType =
  | 'Text'
  | 'Number'
  | 'BigInt'
  | 'Toggle'
  | 'Address'
  | 'List'
  | 'Select';

export interface ArgIR {
  name: string;
  uiType: UiType;
  required: boolean;
  docs?: string[];
  children?: ArgIR[];
}

export interface AccountIR {
  name: string;
  isSigner: boolean;
  isWritable: boolean;
  optional: boolean;
  role?: string;
  seeds?: any[];
}

export interface InstructionIR {
  name: string;
  args: ArgIR[];
  accounts: AccountIR[];
  docs?: string[];
}

interface CodamaInstruction {
  name: string;
  args?: any[];
  accounts?: any[];
  docs?: string[];
}

interface CodamaRoot {
  instructions: CodamaInstruction[];
}

export function mapRootNodeToIR(root: CodamaRoot): InstructionIR[] {
  if (!root || !Array.isArray(root.instructions)) {
    return [];
  }

  return root.instructions.map((instruction) => {
    const args = (instruction.args ?? []).map(mapArgument);
    const accounts = (instruction.accounts ?? []).map(mapAccount);

    return {
      name: instruction.name,
      docs: instruction.docs,
      args,
      accounts
    };
  });
}

function mapArgument(arg: any): ArgIR {
  const optional = Boolean(arg?.isOptional ?? arg?.optional ?? arg?.type?.option);
  const uiType = mapTypeToUi(arg?.type);
  const children = mapNestedArgs(arg?.type);

  return {
    name: arg?.name ?? 'unknown',
    required: !optional,
    uiType,
    docs: arg?.docs,
    ...(children.length > 0 ? { children } : {})
  };
}

function mapAccount(account: any): AccountIR {
  return {
    name: account?.name ?? 'unknown',
    isSigner: Boolean(account?.isSigner ?? account?.signer ?? account?.signer === true),
    isWritable: Boolean(account?.isMut ?? account?.isWritable),
    optional: Boolean(account?.optional),
    role: account?.role,
    seeds: account?.seeds
  };
}

function mapTypeToUi(type: any): UiType {
  if (!type) {
    return 'Text';
  }

  if (typeof type === 'string') {
    switch (type) {
      case 'publicKey':
      case 'pubkey':
        return 'Address';
      case 'bool':
        return 'Toggle';
      case 'string':
        return 'Text';
      case 'u8':
      case 'u16':
      case 'u32':
      case 'i8':
      case 'i16':
      case 'i32':
        return 'Number';
      case 'i64':
      case 'u64':
      case 'i128':
      case 'u128':
      case 'i256':
      case 'u256':
        return 'BigInt';
      default:
        return 'Text';
    }
  }

  if (typeof type === 'object') {
    if (type.option) {
      return mapTypeToUi(type.option);
    }

    if (type.vec || type.array) {
      return 'List';
    }

    if (type.defined) {
      return 'Select';
    }

    if (type.name === 'publicKey') {
      return 'Address';
    }
  }

  return 'Text';
}

function mapNestedArgs(type: any): ArgIR[] {
  if (!type || typeof type !== 'object') {
    return [];
  }

  if (type.struct && Array.isArray(type.struct.fields)) {
    return type.struct.fields.map(mapArgument);
  }

  if (type.tuple && Array.isArray(type.tuple)) {
    return type.tuple.map(mapArgument);
  }

  return [];
}

