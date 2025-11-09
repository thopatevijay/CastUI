import path from 'path';
import { parseIdlToRootNode } from '../parser';

describe('parseIdlToRootNode', () => {
  it('parses an Anchor IDL into a Codama root node', async () => {
    const idlPath = path.resolve(__dirname, '../../../../tests/fixtures/simple_idl.json');
    const root = (await parseIdlToRootNode(idlPath)) as any;
    const program = root.program ?? root.programs?.[0] ?? root;

    expect(program.name).toBe('simpleProgram');
    expect(program.instructions).toBeDefined();
    expect(Array.isArray(program.instructions)).toBe(true);
    expect(program.instructions.length).toBeGreaterThan(0);

    const initialize = program.instructions[0];
    expect(initialize.name).toBe('initialize');
    expect(Array.isArray(initialize.arguments)).toBe(true);
    expect(initialize.arguments.length).toBeGreaterThan(0);
    expect(initialize.accounts.length).toBe(2);
  });
});

