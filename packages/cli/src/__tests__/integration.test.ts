import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CLI_PATH = path.resolve(__dirname, '../../bin/castui.js');
const IDL_PATH = path.resolve(__dirname, '../../../../tests/fixtures/simple_idl.json');
const REPO_ROOT = path.resolve(__dirname, '../../..');

function run(command: string, args: string[], options: { cwd?: string } = {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: 'inherit',
      shell: false
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

describe('castui CLI integration', () => {
  jest.setTimeout(60000);

  it('generates files from IDL without running install', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'castui-integration-'));

    try {
      const outDir = path.join(tmpDir, 'generated');

      await run('yarn', ['workspace', '@castui/cli', 'run', 'build'], { cwd: REPO_ROOT });

      await run('node', [CLI_PATH, '--idl', IDL_PATH, '--out', outDir, '--no-install'], {
        cwd: REPO_ROOT
      });

      const instructionFile = path.join(outDir, 'pages', 'instruction', 'initialize.tsx');
      const metadataFile = path.join(outDir, '.castui', 'metadata.json');

      expect(await fs.pathExists(instructionFile)).toBe(true);
      expect(await fs.pathExists(metadataFile)).toBe(true);

      const metadata = await fs.readJSON(metadataFile);
      expect(metadata.idlPath).toContain('simple_idl.json');
    } finally {
      await fs.remove(tmpDir);
    }
  });
});

