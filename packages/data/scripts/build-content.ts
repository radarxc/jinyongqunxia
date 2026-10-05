import { parseArgs } from 'node:util';
import { buildContent } from '../src/build';

function printDiagnostic(diagnostic: Awaited<ReturnType<typeof buildContent>>['diagnostics'][number]): void {
  const { file, line, column } = diagnostic.primary;
  console.error(file + ':' + line + ':' + column + ' ' + diagnostic.severity + ' ' +
    diagnostic.code + ' ' + diagnostic.message);
}

async function main(): Promise<void> {
  let values: { chapter?: string; locale?: string; 'emit-refs'?: boolean };
  try {
    ({ values } = parseArgs({ options: {
      chapter: { type: 'string' }, locale: { type: 'string' }, 'emit-refs': { type: 'boolean' },
    }, strict: true }));
  } catch (error) {
    console.error('<tool>:1:1 error CONTENT_CLI ' + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 2; return;
  }
  const result = await buildContent({
    ...(values.chapter === undefined ? {} : { chapter: values.chapter }),
    ...(values.locale === undefined ? {} : { locale: values.locale }),
    emitRefs: values['emit-refs'] === true,
  });
  result.diagnostics.forEach(printDiagnostic);
  if (result.diagnostics.some((entry) => entry.severity === 'error')) { process.exitCode = 1; return; }
  console.log('content:build: ' + result.entryCount + ' object(s), ' + result.chapters.length +
    ' chapter(s), ' + result.durationMs.toFixed(1) + ' ms');
}

main().catch((error: unknown) => {
  console.error('<tool>:1:1 error CONTENT_TOOL ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 2;
});
