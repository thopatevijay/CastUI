import path from 'node:path';
import fs from 'fs-extra';
import { parseIdlToRootNode } from './parser';
import { mapRootNodeToIR } from './mapper';
import { renderToDir } from './renderer';
import { execa } from 'execa';

interface GenerateOptions {
  template: string;
  programId?: string;
  noInstall?: boolean;
}

export async function generate(
  idlPath: string,
  outDir: string,
  opts: GenerateOptions
) {
  const resolvedIdl = path.resolve(idlPath);
  const resolvedOut = path.resolve(outDir);

  const root = await parseIdlToRootNode(resolvedIdl);
  const instructions = mapRootNodeToIR(root as any);
  await renderToDir(
    { instructions },
    resolvedOut,
    {
      template: opts.template,
      programId: opts.programId ?? (root as any)?.metadata?.address
    }
  );

  const metaDir = path.join(resolvedOut, '.castui');
  await fs.ensureDir(metaDir);
  await fs.writeJSON(
    path.join(metaDir, 'metadata.json'),
    {
      idlPath: resolvedIdl,
      generatedAt: new Date().toISOString(),
      programId: opts.programId ?? (root as any)?.metadata?.address
    },
    { spaces: 2 }
  );

  if (!opts.noInstall) {
    try {
      await execa('yarn', { cwd: resolvedOut, stdio: 'inherit' });
    } catch (error) {
      await fs.writeFile(
        path.join(metaDir, 'install.log'),
        String(error)
      );
      throw new Error('E_INSTALL_FAILED');
    }
  }
}

