import path from 'path';
import { parseIdlToRootNode } from '../parser';
import { mapRootNodeToIR } from '../mapper';

describe('mapRootNodeToIR', () => {
  it('maps instructions, args, and accounts to IR', async () => {
    const idlPath = path.resolve(__dirname, '../../../../tests/fixtures/simple_idl.json');
    const root = await parseIdlToRootNode(idlPath);
    const ir = mapRootNodeToIR(root as any);

    expect(Array.isArray(ir)).toBe(true);
    expect(ir.length).toBeGreaterThan(0);

    const initialize = ir[0];
    expect(initialize.name).toBe('initialize');
    expect(initialize.accounts).toHaveLength(2);
    expect(initialize.args).toHaveLength(2);

    const valueArg = initialize.args.find((arg) => arg.name === 'value');
    expect(valueArg?.uiType === 'BigInt' || valueArg?.uiType === 'Number').toBe(true);
    expect(valueArg?.required).toBe(true);

    const memoArg = initialize.args.find((arg) => arg.name === 'memo');
    expect(memoArg?.required).toBe(false);
  });

  it('returns empty array when root has no instructions', () => {
    const ir = mapRootNodeToIR({ instructions: [] });
    expect(ir).toEqual([]);
  });
});

