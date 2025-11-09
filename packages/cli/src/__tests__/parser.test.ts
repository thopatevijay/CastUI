import path from 'path';
import { parseIdlToRootNode } from '../parser';

describe('parseIdlToRootNode', () => {
  it('parses an Anchor IDL into a Codama root node', async () => {
    const idlPath = path.resolve(__dirname, '../../../tests/fixtures/simple_idl.json');
    const root = await parseIdlToRootNode(idlPath);

    expect(root.name).toBe('simple_program');
    expect(root.instructions).toBeDefined();
    expect(Array.isArray(root.instructions)).toBe(true);
    expect(root.instructions.length).toBeGreaterThan(0);

    const initialize = root.instructions[0];
    expect(initialize.name).toBe('initialize');
    expect(initialize.args.length).toBe(2);
    expect(initialize.accounts.length).toBe(2);
  });
});

