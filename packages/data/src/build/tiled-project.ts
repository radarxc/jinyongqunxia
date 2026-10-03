import { z } from 'zod';
import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { RegionMapPropertiesSchema, RegionObjectSchema } from '../schemas';
import { canonicalBytes } from './hash';

interface JsonSchema {
  readonly type?: string;
  readonly const?: JsonValue;
  readonly enum?: readonly JsonValue[];
  readonly oneOf?: readonly JsonSchema[];
  readonly anyOf?: readonly JsonSchema[];
  readonly properties?: Readonly<Record<string, JsonSchema>>;
  readonly items?: JsonSchema;
  readonly title?: string;
  readonly minimum?: number;
  readonly exclusiveMinimum?: number;
  readonly maximum?: number;
}
type Member = {
  readonly name: string;
  readonly type: string;
  readonly value: JsonValue;
  readonly propertyType?: string;
};
type PropertyType = JsonValue;

const GENERATED_FIELDS = new Set(['q', 'r', 'h', 'cells', 'class']);
const COLORS = [
  '#ff7cc4a5',
  '#ff59d65d',
  '#ffe25151',
  '#ff4aa5ff',
  '#ffffc145',
  '#ffb985ff',
  '#fff0a43c',
  '#ff9d8cff',
  '#ffff6262',
  '#ff8f754f',
  '#ffffef75',
];
const DEFAULTS: Readonly<Record<string, JsonValue>> = {
  'PlayerSpawn.safe': true,
  'PlayerSpawn.entry': true,
  'Door.mode': 'door',
  'NpcSpawn.gateIntent': 'side',
  'EnemyZone.gateIntent': 'side',
  'Chest.gateIntent': 'side',
  'QinggongGate.kind': 'leap',
  'QinggongGate.intent': 'side',
  'QinggongGate.reveal': 'always',
  'QinggongGate.tier': 1,
  'QinggongGate.alt': '[]',
  'QinggongGate.hintTextKey': 'hint.required',
  'CameraHint.yawDeg': 45,
  'CameraHint.zoom': 1,
  'CameraHint.allowRotation': true,
  'BattleArena.playerCapacity': 1,
  'BattleArena.enemyCapacity': 1,
  'Light.color': '#ffffffff',
  'Light.radius': 4,
  'Light.intensity': 1,
  'Light.mountHeight': 2,
  'Light.schedule': 'always',
};
const member = (name: string, type: string, value: JsonValue, propertyType?: string): Member => ({
  name,
  type,
  value,
  ...(propertyType === undefined ? {} : { propertyType }),
});
const enumType = (
  id: number,
  name: string,
  storageType: 'string' | 'int',
  values: readonly string[],
): PropertyType => ({
  type: 'enum',
  id,
  name,
  storageType,
  values: [...values],
  valuesAsFlags: false,
});
const classType = (
  id: number,
  name: string,
  members: readonly Member[],
  color: string,
  useAs: 'map' | 'object',
): PropertyType => ({
  type: 'class',
  id,
  name,
  members: [...members],
  color,
  useAs: [useAs],
});
const pascal = (value: string): string => value.slice(0, 1).toUpperCase() + value.slice(1);
const withoutNull = (schema: JsonSchema): JsonSchema => {
  const options = schema.anyOf ?? schema.oneOf;
  return options?.find((entry) => entry.type !== 'null') ?? schema;
};

function defaultValue(className: string, name: string, schema: JsonSchema): JsonValue {
  const override = DEFAULTS[`${className}.${name}`];
  if (override !== undefined) return override;
  const value = withoutNull(schema);
  if (value.const !== undefined) return value.const;
  if (value.enum?.[0] !== undefined) return value.enum[0];
  if ((value.oneOf ?? value.anyOf)?.[0]?.const !== undefined)
    return (value.oneOf ?? value.anyOf)![0]!.const!;
  if (value.type === 'boolean') return false;
  if (value.type === 'integer' || value.type === 'number') {
    const floor = value.exclusiveMinimum === undefined ? value.minimum : value.exclusiveMinimum + 1;
    return typeof floor === 'number' && floor > 0 ? floor : 0;
  }
  return '';
}
function enumDefinition(
  input: JsonSchema,
): { storageType: 'string' | 'int'; values: readonly string[] } | undefined {
  const schema = withoutNull(input);
  if (schema.enum?.every((entry) => typeof entry === 'string') === true)
    return { storageType: 'string', values: schema.enum as readonly string[] };
  if (
    schema.type === 'integer' &&
    Number.isInteger(schema.minimum) &&
    Number.isInteger(schema.maximum) &&
    schema.maximum! - schema.minimum! <= 31
  )
    return {
      storageType: 'int',
      values: Array.from({ length: schema.maximum! - schema.minimum! + 1 }, (_, index) =>
        String(schema.minimum! + index),
      ),
    };
  return undefined;
}
function enumName(schema: JsonSchema): string | undefined {
  const value = withoutNull(schema);
  return value.title !== undefined && enumDefinition(value) !== undefined ? value.title : undefined;
}
function scalarMember(className: string, name: string, input: JsonSchema): Member {
  const schema = withoutNull(input);
  const custom = enumName(schema);
  if (name === 'color') return member(name, 'color', defaultValue(className, name, schema));
  if (schema.type === 'boolean') return member(name, 'bool', defaultValue(className, name, schema));
  if (
    schema.type === 'integer' ||
    schema.oneOf?.every((entry) => Number.isInteger(entry.const)) === true
  )
    return member(name, 'int', defaultValue(className, name, schema), custom);
  if (schema.type === 'number') return member(name, 'float', defaultValue(className, name, schema));
  return member(name, 'string', defaultValue(className, name, schema), custom);
}
function flattenMember(className: string, name: string, schema: JsonSchema): readonly Member[] {
  if (schema.type === 'array')
    return [member(name, 'string', DEFAULTS[`${className}.${name}`] ?? '')];
  if (schema.properties === undefined) return [scalarMember(className, name, schema)];
  const prefix = name === 'interiorRect' ? 'interior' : name === 'gateIntent' ? '' : name;
  return Object.entries(schema.properties).flatMap(([child, childSchema]) => {
    const flatName =
      name === 'gateIntent' && child === 'intent'
        ? 'gateIntent'
        : name === 'gateIntent'
          ? child
          : name === 'to' && child === 'cell'
            ? 'to'
          : `${prefix}${pascal(child)}`;
    return flattenMember(className, flatName, childSchema);
  });
}

function schemasWithTitles(schema: JsonSchema): readonly JsonSchema[] {
  return [
    schema,
    ...Object.values(schema.properties ?? {}).flatMap(schemasWithTitles),
    ...(schema.oneOf ?? []).flatMap(schemasWithTitles),
    ...(schema.anyOf ?? []).flatMap(schemasWithTitles),
    ...(schema.items === undefined ? [] : schemasWithTitles(schema.items)),
  ].filter((entry) => entry.title !== undefined);
}
function generatedEnums(schemas: readonly JsonSchema[]): readonly PropertyType[] {
  const definitions = new Map<string, ReturnType<typeof enumDefinition>>();
  for (const schema of schemas.flatMap(schemasWithTitles)) {
    const definition = enumDefinition(schema);
    if (definition === undefined || schema.title === undefined) continue;
    const prior = definitions.get(schema.title);
    if (prior !== undefined && JSON.stringify(prior) !== JSON.stringify(definition))
      throw new TypeError(`TILED_PROPERTY_TYPE_CONFLICT:${schema.title}`);
    definitions.set(schema.title, definition);
  }
  return [...definitions.entries()]
    .sort(([left], [right]) => compareCodePoints(left, right))
    .map(([name, definition], index) =>
      enumType(index + 1, name, definition!.storageType, definition!.values),
    );
}
function generatedClass(
  id: number,
  schema: JsonSchema,
  color: string,
  useAs: 'map' | 'object',
): PropertyType {
  const properties = schema.properties ?? {};
  const className = schema.title ?? String(properties['class']?.const ?? '');
  const members = Object.entries(properties)
    .filter(([name]) => !GENERATED_FIELDS.has(name))
    .flatMap(([name, memberSchema]) => flattenMember(className, name, memberSchema));
  return classType(id, className, members, color, useAs);
}
function generatedTypes(): readonly PropertyType[] {
  const objectSchema = z.toJSONSchema(RegionObjectSchema, { io: 'input' }) as JsonSchema;
  const mapSchema = z.toJSONSchema(RegionMapPropertiesSchema, { io: 'input' }) as JsonSchema;
  const classes = (objectSchema.oneOf ?? []).map((variant, index) =>
    generatedClass(20 + index, variant, COLORS[index]!, 'object'),
  );
  return [
    ...generatedEnums([mapSchema, objectSchema]),
    generatedClass(19, mapSchema, '#ff6b7280', 'map'),
    ...classes,
  ];
}

export function tiledProjectValue(): JsonValue {
  return {
    propertyTypes: generatedTypes(),
    folders: ['../world/regions'],
    extensionsPath: 'extensions',
    automappingRulesFile: '',
    commands: [],
    properties: [],
  };
}
export function tiledProjectBytes(): Uint8Array {
  return canonicalBytes(tiledProjectValue(), true);
}
