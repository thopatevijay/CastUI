import path from 'node:path';
import ejs from 'ejs';
import fs from 'fs-extra';

interface InstructionIR {
  name: string;
  args: any[];
  accounts: any[];
  docs?: string[];
}

interface RenderOptions {
  template: string;
  programId?: string;
}

interface RenderInput {
  instructions: InstructionIR[];
}

export async function renderToDir(
  ir: RenderInput,
  outDir: string,
  opts: RenderOptions
): Promise<void> {
  const templateDir = path.resolve(__dirname, '../../templates', opts.template);

  await fs.ensureDir(outDir);
  await fs.copy(templateDir, outDir, {
    overwrite: true,
    filter: (src) => !src.endsWith('.ejs')
  });

  const appTemplate = await fs.readFile(
    path.join(templateDir, 'pages', '_app.ejs'),
    'utf8'
  );
  const appContent = ejs.render(appTemplate, { programId: opts.programId ?? '' });
  await fs.outputFile(path.join(outDir, 'pages', '_app.tsx'), appContent);

  const instructionTemplatePath = path.join(
    templateDir,
    'pages',
    'instruction.ejs'
  );
  const instructionTemplate = await fs.readFile(instructionTemplatePath, 'utf8');

  for (const instruction of ir.instructions) {
    const content = ejs.render(instructionTemplate, { instruction });
    const instructionDir = path.join(outDir, 'pages', 'instruction');
    await fs.ensureDir(instructionDir);
    await fs.outputFile(
      path.join(instructionDir, `${instruction.name}.tsx`),
      content
    );
  }
}

