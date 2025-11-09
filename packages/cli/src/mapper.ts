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

type CodamaInstruction = {
  name: string;
  args?: any[];
  accounts?: any[];
  docs?: string[];
};

type CodamaProgram = {
  name: string;
  instructions?: CodamaInstruction[];
};

type CodamaRoot = {
  instructions?: CodamaInstruction[];
  program?: CodamaProgram;
  programs?: CodamaProgram[];
};

function extractInstructions(root: CodamaRoot): CodamaInstruction[] {
  if (!root) {
    return [];
  }

  if (Array.isArray(root.instructions) && root.instructions.length > 0) {
    return root.instructions;
  }

  if (Array.isArray(root.program?.instructions) && root.program?.instructions.length) {
    return root.program.instructions;
  }

  if (Array.isArray(root.programs?.[0]?.instructions) && root.programs?.[0]?.instructions?.length) {
    return root.programs[0].instructions ?? [];
  }

  return [];
}

export function mapRootNodeToIR(root: CodamaRoot): InstructionIR[] {
  const instructions = extractInstructions(root);

  if (!instructions.length) {
    return [];
  }

  return instructions.map((instruction: any) => {
    const rawArgs = instruction.arguments ?? instruction.args ?? [];
    const args = rawArgs
      .filter((arg: any) => arg.name !== 'discriminator')
      .map(mapArgument);
    const accounts = (instruction.accounts ?? []).map(mapAccount);

    return {
      name: instruction.name,
      docs: instruction.docs,
      args,
      accounts
    };
  });
}

function isOptionType(type: any): boolean {
  if (!type) return false;
  if (type.option || type.optional) return true;
  if (typeof type === 'object' && type.kind === 'optionTypeNode') return true;
  return false;
}

function mapArgument(arg: any): ArgIR {
  const optional = Boolean(arg?.isOptional ?? arg?.optional ?? isOptionType(arg?.type));
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
    isSigner: Boolean(account?.isSigner ?? account?.signer === true),
    isWritable: Boolean(account?.isMut ?? account?.isWritable),
    optional: Boolean(account?.optional ?? account?.isOptional),
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
    switch (type.kind) {
      case 'publicKeyTypeNode':
        return 'Address';
      case 'booleanTypeNode':
        return 'Toggle';
      case 'stringTypeNode':
      case 'utf8StringTypeNode':
        return 'Text';
      case 'numberTypeNode': {
        const format = type.format;
        if (['i64', 'u64', 'i128', 'u128', 'i256', 'u256'].includes(format)) {
          return 'BigInt';
        }
        return 'Number';
      }
      case 'bytesTypeNode':
      case 'setTypeNode':
      case 'vectorTypeNode':
      case 'arrayTypeNode':
        return 'List';
      case 'optionTypeNode':
        return mapTypeToUi(type.item ?? type.type);
      case 'enumTypeNode':
        return 'Select';
      case 'structTypeNode':
        return 'Text';
      default:
        break;
    }

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

  if (type.kind === 'structTypeNode' && Array.isArray(type.fields)) {
    return type.fields.map((field: any) =>
      mapArgument({
        name: field.name,
        type: field.type,
        docs: field.docs
      })
    );
  }

  if (type.struct && Array.isArray(type.struct.fields)) {
    return type.struct.fields.map(mapArgument);
  }

  if (type.tuple && Array.isArray(type.tuple)) {
    return type.tuple.map(mapArgument);
  }

  return [];
}

