import fs from 'fs-extra';
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';

export type RootNode = ReturnType<typeof rootNodeFromAnchor>;

export async function parseIdlToRootNode(idlPath: string): Promise<RootNode> {
  const raw = await fs.readFile(idlPath, 'utf8');
  const idl = JSON.parse(raw);
  const root = rootNodeFromAnchor(idl as any);
  return root;
}

