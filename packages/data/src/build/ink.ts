import { Compiler, CompilerOptions } from 'inkjs/full';
import { canonicalJson, compareCodePoints, type JsonValue } from '@tianshu/shared';
import { parseYamlFile } from '../content-registry';
import type { Diagnostic, SourceSpan } from './types';
import { hashValue } from './hash';
import { EventActionSchema, INK_OPCODE_REGISTRY, type EventAction } from '../schemas/event-actions';

export interface InkMeta { readonly schemaVersion: 'inkmeta.v1'; readonly storyId: string;
  readonly chapter: string; readonly region?: string; readonly entryKnots: readonly string[];
  readonly readFlags: readonly string[]; readonly commands: readonly string[]; readonly npcs: readonly string[]; }
export interface DialogueStructureDef extends InkMeta { readonly kind: 'dialogueStructure';
  readonly knots: readonly string[]; readonly stitches: readonly string[]; readonly variables: readonly string[];
  readonly diverts: readonly string[]; readonly choices: readonly string[]; readonly tags: readonly DecodedTag[];
  readonly externals: readonly string[]; readonly storyHash: string; }
export interface DecodedTag { readonly [key: string]: JsonValue;
  readonly opcode: string; readonly args: Readonly<Record<string, string>>; }
export interface CompiledInk { readonly storyId: string; readonly storyJson: string;
  readonly text: Readonly<Record<string, string>>;
  readonly structure: DialogueStructureDef; readonly diagnostics: readonly Diagnostic[]; }

/** Shared by authoring validation and the deterministic core runtime decoder. */
export const OPCODES = INK_OPCODE_REGISTRY;
export const INK_OPCODE_NAMES: readonly string[] = Object.freeze(Object.keys(OPCODES));
const EXTERNALS = new Set(['get_flag', 'quest_stage', 'has_item', 'affinity']);
const META_ID = /^(?:story|ink)_[a-z0-9_]+$/u;
const CHAPTER_ID = /^ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/u;
const span = (file: string, line = 1, column = 1): SourceSpan =>
  ({ file, line, column, endLine: line, endColumn: column });

export function decodeInkTag(raw: string, file = '<ink>', line = 1): DecodedTag {
  if (!raw.startsWith('ts:') || raw.includes('{') || raw.includes('}')) throw new TypeError(`INK_TAG_FORMAT:${file}:${line}`);
  const [opcode, ...tokens] = raw.slice(3).trim().split(/\s+/u); const spec = opcode ? OPCODES[opcode] : undefined;
  if (!spec) throw new TypeError(`INK_TAG_OPCODE:${file}:${line}:${String(opcode)}`);
  const allowed = { ...spec.required, ...(spec.optional ?? {}) };
  const args: Record<string, string> = {};
  const tokenKeys = tokens.map((token) => token.match(/^([A-Za-z][A-Za-z0-9]*)=/u)?.[1])
    .filter((key): key is string => key !== undefined);
  const duplicateKey = tokenKeys.find((key, index) => tokenKeys.indexOf(key) !== index);
  if (duplicateKey !== undefined)
    throw new TypeError(`INK_TAG_DUPLICATE:${file}:${line}:${duplicateKey}`);
  for (const token of tokens) {
    const match = token.match(/^([A-Za-z][A-Za-z0-9]*)=([^{}()[\]"'\s]+)$/u);
    const validator = match ? allowed[match[1]!] : undefined;
    if (match && args[match[1]!] !== undefined)
      throw new TypeError(`INK_TAG_DUPLICATE:${file}:${line}:${match[1]}`);
    if (!match || validator === undefined || !validator.test(match[2]!))
      throw new TypeError(`INK_TAG_PARAM:${file}:${line}:${token}`);
    args[match[1]!] = match[2]!;
  }
  if (Object.keys(spec.required).some((key) => args[key] === undefined))
    throw new TypeError(`INK_TAG_MISSING:${file}:${line}`);
  return { opcode: opcode!, args };
}

function inkScalar(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^[1-9][0-9]*$/u.test(value)) {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) throw new TypeError('INK_TAG_INTEGER');
    return parsed;
  }
  return value;
}

/** Decode with the Ink registry, then materialize the canonical EventAction value. */
export function decodeInkAction(raw: string, file = '<ink>', line = 1): EventAction {
  const decoded = decodeInkTag(raw, file, line);
  const args = Object.fromEntries(Object.entries(decoded.args).map(([key, value]) =>
    [key, inkScalar(value)]));
  return EventActionSchema.parse({ op: decoded.opcode, ...args });
}

export function parseInkMeta(text: string, file: string): InkMeta {
  const value = parseYamlFile({ path: file, text });
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError(`INK_META:${file}`);
  const meta = value as Record<string, unknown>;
  const keys = ['schemaVersion', 'storyId', 'chapter', 'region', 'entryKnots', 'readFlags', 'commands', 'npcs'];
  if (Object.keys(meta).some((key) => !keys.includes(key)) || meta['schemaVersion'] !== 'inkmeta.v1' ||
      typeof meta['storyId'] !== 'string' || !META_ID.test(meta['storyId']) ||
      typeof meta['chapter'] !== 'string' || !CHAPTER_ID.test(meta['chapter']) ||
      !['entryKnots', 'readFlags', 'commands', 'npcs'].every((key) =>
        Array.isArray(meta[key]) && (meta[key] as unknown[]).every((item) => typeof item === 'string')))
    throw new TypeError(`INK_META:${file}`);
  if (meta['region'] !== undefined && (typeof meta['region'] !== 'string' ||
      !/^rg_[a-z0-9_]+$/u.test(meta['region']))) throw new TypeError(`INK_META:${file}`);
  for (const key of ['entryKnots', 'readFlags', 'commands', 'npcs'] as const)
    if (new Set(meta[key] as string[]).size !== (meta[key] as string[]).length)
      throw new TypeError(`INK_META_DUPLICATE:${file}:${key}`);
  if ((meta['entryKnots'] as string[]).length === 0) throw new TypeError(`INK_META_ENTRY:${file}`);
  return meta as unknown as InkMeta;
}

function extractStoryText(storyJson: string, storyId: string):
  { readonly storyJson: string; readonly text: Readonly<Record<string, string>> } {
  const text: Record<string, string> = {}; let ordinal = 0;
  const walk = (value: JsonValue): JsonValue => {
    if (Array.isArray(value)) {
      let inTag = false; let stringDepth = 0;
      const choiceText = new Set<number>(); const evaluationStarts: number[] = [];
      for (let index = 0; index < value.length; index += 1) {
        const item = value[index];
        if (item === 'ev') { evaluationStarts.push(index); continue; }
        if (item !== '/ev') continue;
        const start = evaluationStarts.pop(); const choice = value[index + 1];
        if (start === undefined || value[start + 1] !== 'str' || typeof choice !== 'object' ||
            choice === null || Array.isArray(choice) || !('*' in choice)) continue;
        let choiceStringDepth = 0; let nestedEvaluationDepth = 0;
        for (let cursor = start + 1; cursor < index; cursor += 1) {
          const token = value[cursor];
          if (token === 'str') { choiceStringDepth += 1; continue; }
          if (token === '/str') {
            choiceStringDepth = Math.max(0, choiceStringDepth - 1);
            if (choiceStringDepth === 0) break;
            continue;
          }
          if (token === 'ev') { nestedEvaluationDepth += 1; continue; }
          if (token === '/ev') { nestedEvaluationDepth = Math.max(0, nestedEvaluationDepth - 1); continue; }
          if (choiceStringDepth === 1 && nestedEvaluationDepth === 0 &&
              typeof token === 'string' && token.startsWith('^')) choiceText.add(cursor);
        }
      }
      return value.map((item, index) => {
        if (item === '#') { inTag = true; return item; }
        if (item === '/#') { inTag = false; return item; }
        if (item === 'str') { stringDepth += 1; return item; }
        if (item === '/str') { stringDepth = Math.max(0, stringDepth - 1); return item; }
        // Ink wraps both runtime string values and choice labels in str.../str. Only the
        // outer literal segments of an evaluation immediately feeding a choice are visible text.
        if (!inTag && typeof item === 'string' && item.startsWith('^') &&
            (stringDepth === 0 || choiceText.has(index))) {
          const display = item.slice(1);
          if (/<\/?[A-Za-z][^>]*>/u.test(display)) throw new TypeError(`INK_TEXT_HTML:${storyId}`);
          const key = `ink.${storyId}.text.${String(ordinal).padStart(4, '0')}`;
          ordinal += 1; text[key] = display; return `^${key}`;
        }
        return walk(item);
      });
    }
    if (typeof value === 'object' && value !== null)
      return Object.fromEntries(Object.entries(value).map(([key, item]) =>
        [key, walk(item as JsonValue)]));
    return value;
  };
  const localized = walk(JSON.parse(storyJson) as JsonValue);
  return { storyJson: canonicalJson(localized), text };
}

function sourceStructure(source: string, file: string): Omit<DialogueStructureDef, keyof InkMeta | 'kind' | 'storyHash'> {
  const lines = source.split(/\r?\n/u); const knots: string[] = []; const stitches: string[] = [];
  const variables: string[] = []; const diverts: string[] = []; const choices: string[] = [];
  const tags: DecodedTag[] = []; const externals: string[] = [];
  let knotScope = 'root'; let scope = knotScope; let choiceOrdinal = 0; let tagOrdinal = 0;
  let pendingChoice: number | undefined;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!; let match: RegExpMatchArray | null;
    if ((match = line.match(/^===\s*([A-Za-z_][A-Za-z0-9_]*)\s*===/u))) {
      knotScope = match[1]!; scope = knotScope; choiceOrdinal = 0; tagOrdinal = 0;
      pendingChoice = undefined; knots.push(scope);
    }
    if ((match = line.match(/^=\s*([A-Za-z_][A-Za-z0-9_]*)\s*$/u))) {
      scope = `${knotScope}.${match[1]!}`; choiceOrdinal = 0; tagOrdinal = 0;
      pendingChoice = undefined; stitches.push(`${knotScope}.${match[1]!}`);
    }
    if ((match = line.match(/^\s*(?:VAR|CONST)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/u)))
      variables.push(`${match[1]!}=${match[2]!.replace(/\s+/gu, ' ')}`);
    if ((match = line.match(/^\s*EXTERNAL\s+([A-Za-z_][A-Za-z0-9_]*)/u))) externals.push(match[1]!);
    if (line.match(/^\s*[+*]\s*\[[^\]]+\]/u)) {
      choices.push(`${scope}.choice.${String(choiceOrdinal).padStart(3, '0')}`);
      pendingChoice = choices.length - 1; choiceOrdinal += 1;
    }
    for (const divert of line.matchAll(/->\s*([A-Za-z_][A-Za-z0-9_.]*)/gu))
      if (divert[1] !== 'END' && divert[1] !== 'DONE') {
        const target = divert[1]!; diverts.push(`${scope}->${target}`);
        if (pendingChoice !== undefined) { choices[pendingChoice] += `->${target}`; pendingChoice = undefined; }
      }
    const tagAt = line.indexOf('#ts:');
    if (tagAt >= 0) { tags.push({ ...decodeInkTag(line.slice(tagAt + 1).trim(), file, index + 1),
      key: `${scope}.tag.${String(tagOrdinal).padStart(3, '0')}` }); tagOrdinal += 1; }
  }
  const ordered = (values: readonly string[]): string[] => [...new Set(values)].sort(compareCodePoints);
  return { knots: ordered(knots), stitches: ordered(stitches), variables: ordered(variables),
    diverts: ordered(diverts), choices: ordered(choices), tags: [...tags].sort((left, right) =>
      compareCodePoints(String(left['key']), String(right['key'])) ||
      compareCodePoints(`${left.opcode}:${canonicalJson(left.args)}`, `${right.opcode}:${canonicalJson(right.args)}`)),
    externals: ordered(externals) };
}

export async function compileInk(source: string, metaText: string, file: string): Promise<CompiledInk> {
  const meta = parseInkMeta(metaText, file.replace(/\.ink$/u, '.inkmeta.yaml'));
  if (!file.endsWith(`/${meta.storyId}.ink`) && !file.endsWith(`${meta.storyId}.ink`))
    throw new TypeError(`INK_STORY_ID:${file}:${meta.storyId}`);
  const diagnostics: Diagnostic[] = [];
  const options = new CompilerOptions(null, [], false, (message, type) => {
    const line = Number(message.match(/line (\d+)/u)?.[1] ?? 1);
    diagnostics.push({ code: type === 1 ? 'INK_WARNING' : 'INK_COMPILE',
      severity: type === 1 ? 'warning' : type === 0 ? 'info' : 'error',
      message: message.replace(/^.*?(?:line \d+: )?/u, ''), primary: span(file, line) });
  });
  let storyJson: string;
  try { storyJson = new Compiler(source, options).Compile().ToJson() ?? ''; }
  catch (error) {
    if (diagnostics.length === 0) diagnostics.push({ code: 'INK_COMPILE', severity: 'error',
      message: error instanceof Error ? error.message : String(error), primary: span(file) });
    return { storyId: meta.storyId, storyJson: '', text: {}, structure: { ...meta, kind: 'dialogueStructure',
      knots: [], stitches: [], variables: [], diverts: [], choices: [], tags: [], externals: [], storyHash: '0'.repeat(64) }, diagnostics };
  }
  const raw = sourceStructure(source, file);
  for (const entry of meta.entryKnots) if (!raw.knots.includes(entry))
    throw new TypeError(`INK_ENTRY_UNKNOWN:${file}:${entry}`);
  for (const external of raw.externals) if (!EXTERNALS.has(external))
    throw new TypeError(`INK_EXTERNAL_UNKNOWN:${file}:${external}`);
  for (const command of meta.commands) if (!OPCODES[command])
    throw new TypeError(`INK_META_OPCODE:${file}:${command}`);
  for (const tag of raw.tags) if (!meta.commands.includes(tag.opcode))
    throw new TypeError(`INK_TAG_UNDECLARED:${file}:${tag.opcode}`);
  const structural = { ...meta, entryKnots: [...meta.entryKnots].sort(compareCodePoints),
    readFlags: [...meta.readFlags].sort(compareCodePoints),
    commands: [...meta.commands].sort(compareCodePoints), npcs: [...meta.npcs].sort(compareCodePoints),
    kind: 'dialogueStructure' as const, ...raw };
  const localized = extractStoryText(storyJson, meta.storyId);
  const storyHash = await hashValue([structural, JSON.parse(localized.storyJson) as JsonValue]);
  return { storyId: meta.storyId, ...localized, structure: { ...structural, storyHash }, diagnostics };
}
