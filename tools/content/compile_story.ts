import { resolve } from 'node:path';
import { compileCondition, compileStoryLine, compileStoryLines } from '../../packages/core/src/index';
import { discoverContent } from '../../packages/data/src/build/discover';
import { ContentYamlError, parseYamlFileWithLocations,
  type ParsedYamlFile } from '../../packages/data/src/tooling';
import { QuestEffectSchema, StoryLineSchema, type StoryLine } from '../../packages/data/src/schemas/index';
import { compareCodePoints, type JsonValue } from '../../packages/shared/src/index';

export interface StorySource { readonly path: string; readonly text: string; }
export interface StoryCompileDiagnostic {
  readonly file: string; readonly line: number; readonly column: number;
  readonly code: string; readonly message: string;
}
interface ParsedStory { readonly source: StorySource; readonly value: StoryLine;
  readonly yaml: ParsedYamlFile; }
type Path = readonly (string | number)[];

function codeFor(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.match(/^[A-Z][A-Z0-9_]*/u)?.[0] ?? fallback;
}
function diagnostic(parsed: ParsedStory, path: Path, code: string, message: string):
StoryCompileDiagnostic {
  return { file: parsed.source.path, ...parsed.yaml.position(path), code, message };
}

function actionDiagnostics(parsed: Omit<ParsedStory, 'value'>, raw: unknown): StoryCompileDiagnostic[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const nodes = (raw as { nodes?: unknown }).nodes;
  if (!Array.isArray(nodes)) return [];
  const result: StoryCompileDiagnostic[] = [];
  nodes.forEach((node, nodeIndex) => {
    if (typeof node !== 'object' || node === null) return;
    const actions = (node as { payload?: { inlineEvent?: { actions?: unknown } } })
      .payload?.inlineEvent?.actions;
    if (!Array.isArray(actions)) return;
    actions.forEach((action, actionIndex) => {
      const checked = QuestEffectSchema.safeParse(action);
      if (checked.success) return;
      for (const issue of checked.error.issues) {
        const path = ['nodes', nodeIndex, 'payload', 'inlineEvent', 'actions', actionIndex,
          ...issue.path] as Path;
        result.push(diagnostic(parsed as ParsedStory, path, 'STORY_ACTION', issue.message));
      }
    });
  });
  return result;
}

function conditionSites(line: StoryLine): readonly { readonly path: Path;
  readonly value: JsonValue }[] {
  const sites: { path: Path; value: JsonValue }[] = [];
  if (line.trigger?.condition !== undefined)
    sites.push({ path: ['trigger', 'condition'], value: line.trigger.condition as JsonValue });
  line.sideHooks.forEach((hook, index) =>
    sites.push({ path: ['sideHooks', index, 'when'], value: hook.when as JsonValue }));
  line.nodes.forEach((node, nodeIndex) => {
    if (node.type === 'condition') sites.push({
      path: ['nodes', nodeIndex, 'payload', 'expression'],
      value: node.payload.expression as JsonValue,
    });
    if (node.type === 'choice') node.payload.options.forEach((option, optionIndex) => {
      if (option.when !== undefined) sites.push({
        path: ['nodes', nodeIndex, 'payload', 'options', optionIndex, 'when'],
        value: option.when as JsonValue,
      });
    });
  });
  line.edges.forEach((edge, index) => {
    if (edge.trigger === 'condition') sites.push({
      path: ['edges', index, 'condition'], value: edge.condition as JsonValue,
    });
  });
  return sites;
}

function parseStory(source: StorySource): { readonly parsed?: ParsedStory;
  readonly diagnostics: readonly StoryCompileDiagnostic[] } {
  let yaml: ParsedYamlFile;
  try { yaml = parseYamlFileWithLocations(source); } catch (error) {
    return { diagnostics: [{ file: source.path,
      line: error instanceof ContentYamlError ? error.line : 1,
      column: error instanceof ContentYamlError ? error.column : 1,
      code: codeFor(error, 'STORY_YAML'), message: error instanceof Error ? error.message : String(error) }] };
  }
  const actions = actionDiagnostics({ source, yaml }, yaml.value);
  const checked = StoryLineSchema.safeParse(yaml.value);
  if (!checked.success) {
    const schema = checked.error.issues.map((issue) => diagnostic(
      { source, yaml, value: undefined as never }, issue.path as Path,
      'STORY_SCHEMA', issue.message));
    return { diagnostics: actions.length > 0 ? actions : schema };
  }
  return { parsed: { source, yaml, value: checked.data }, diagnostics: [] };
}

function compileParsed(parsed: ParsedStory): StoryCompileDiagnostic[] {
  const result: StoryCompileDiagnostic[] = [];
  for (const site of conditionSites(parsed.value)) {
    try { compileCondition(site.value); } catch (error) {
      result.push(diagnostic(parsed, site.path, codeFor(error, 'STORY_CONDITION'),
        error instanceof Error ? error.message : String(error)));
    }
  }
  if (result.length > 0) return result;
  try { compileStoryLine(parsed.value); } catch (error) {
    result.push(diagnostic(parsed, [], codeFor(error, 'STORY_COMPILE'),
      error instanceof Error ? error.message : String(error)));
  }
  return result;
}
function compareDiagnostics(left: StoryCompileDiagnostic, right: StoryCompileDiagnostic): number {
  return compareCodePoints(left.file, right.file) || left.line - right.line ||
    left.column - right.column || compareCodePoints(left.code, right.code);
}

export function compileStorySources(sources: readonly StorySource[]): {
  readonly storyCount: number; readonly chapterCount: number;
  readonly diagnostics: readonly StoryCompileDiagnostic[];
} {
  const parsed: ParsedStory[] = []; const diagnostics: StoryCompileDiagnostic[] = [];
  for (const source of sources) {
    const result = parseStory(source);
    diagnostics.push(...result.diagnostics);
    if (result.parsed !== undefined) parsed.push(result.parsed);
  }
  for (const story of parsed) diagnostics.push(...compileParsed(story));
  const chapters = new Map<string, ParsedStory[]>();
  for (const story of parsed) {
    const bucket = chapters.get(story.value.chapterId) ?? [];
    bucket.push(story); chapters.set(story.value.chapterId, bucket);
  }
  if (diagnostics.length === 0) for (const lines of chapters.values()) {
    try { compileStoryLines(lines.map((entry) => entry.value)); } catch (error) {
      diagnostics.push(diagnostic(lines[0]!, [], codeFor(error, 'STORY_CHAPTER'),
        error instanceof Error ? error.message : String(error)));
    }
  }
  return { storyCount: parsed.length, chapterCount: chapters.size,
    diagnostics: diagnostics.sort(compareDiagnostics) };
}

export function formatStoryDiagnostic(value: StoryCompileDiagnostic): string {
  return `${value.file}:${value.line}:${value.column} error ${value.code} ${value.message}`;
}
export async function loadStorySources(rootDir = process.cwd()): Promise<readonly StorySource[]> {
  const discovered = await discoverContent(resolve(rootDir));
  return discovered.filter((source) => source.kind === 'content' &&
      source.path.startsWith('content/story/') && source.path.endsWith('.yaml'))
    .map(({ path, text }) => ({ path, text }));
}

async function main(): Promise<void> {
  const result = compileStorySources(await loadStorySources());
  for (const entry of result.diagnostics) console.error(formatStoryDiagnostic(entry));
  if (result.diagnostics.length > 0) process.exitCode = 1;
  else console.log(`content:compile-story: ${result.storyCount} story line(s) in ` +
    `${result.chapterCount} chapter(s) compiled`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === import.meta.filename)
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
