import type { EventAction, QuestDef, StoryNode } from '@tianshu/data/schemas';
import { Story } from 'inkjs/engine/Story';
import { decodeInkAction } from '../../../data/src/build/ink';
import type { GameState, StoryLineState } from '../state';
export * from './state';

export interface DialogueLine { readonly speakerId: string; readonly textKey: string; }
export interface DialogueChoice { readonly key: string; readonly textKey: string; }
export interface DialogueTagIntent {
  readonly action: EventAction; readonly sourcePath: string;
  readonly visitCounter: number; readonly tagOrdinal: number;
}
export type InkExternalName = 'get_flag' | 'quest_stage' | 'has_item' | 'affinity';
export type InkScalar = string | number | boolean | null;
export type InkExternalQuery = (name: InkExternalName, args: readonly unknown[]) => InkScalar;
export interface DialogueSession {
  readonly mode: 'inline' | 'ink'; readonly storyId: string | null; readonly knot: string | null;
  readonly lines: readonly DialogueLine[]; readonly choices: readonly DialogueChoice[];
  readonly intents?: readonly DialogueTagIntent[];
  readonly canContinue?: boolean;
  readonly serializedState?: string;
}
export interface InkDialogueBridge {
  start(storyId: string, knot: string, seed: number): DialogueSession;
  continue?(session: DialogueSession): DialogueSession;
  choose(session: DialogueSession, choiceKey: string): DialogueSession;
  restore(storyId: string, serializedState: string): DialogueSession;
  save(session: DialogueSession): string;
}
export type InkStoryLoader = (storyId: string) => string | Readonly<Record<string, unknown>>;
const INTENT_COUNTER_KEY = '__tianshuDialogueIntentCounter';

function oneString(name: InkExternalName, args: readonly unknown[]): string {
  if (args.length !== 1 || typeof args[0] !== 'string')
    throw new TypeError(`INK_EXTERNAL_ARGUMENT:${name}`);
  return args[0];
}
function questStage(definition: QuestDef, line: StoryLineState | undefined): string {
  return line?.activeNodeIds[0] ?? line?.completedNodeIds.at(-1) ?? definition.startStageId;
}

/** Snapshot-only Ink queries. These callbacks never mutate state or consume RNG. */
export function inkExternalQuery(state: Readonly<GameState>, quests: readonly QuestDef[] = []):
InkExternalQuery {
  return (name, args) => {
    const id = oneString(name, args);
    if (name === 'get_flag') return state.profile.replayRules?.switches[id] === true;
    if (name === 'has_item')
      return (state.party.inventory.stacks.find((entry) => entry.itemId === id)?.count ?? 0) > 0;
    if (name === 'affinity')
      return state.chapter.npcs.find((entry) => entry.npcId === id)?.affinity ?? 0;
    const definition = quests.find((entry) => entry.id === id);
    if (!definition) return null;
    return questStage(definition, state.chapter.story.lines.find((entry) => entry.lineId === id));
  };
}

/** inkjs runtime adapter; compilation and story asset lookup stay with the host. */
export class InkJsDialogueBridge implements InkDialogueBridge {
  private readonly intentCounters = new WeakMap<Story, number>();

  public constructor(private readonly loadStory: InkStoryLoader,
    private readonly query?: InkExternalQuery) {}

  public start(storyId: string, knot: string, seed: number): DialogueSession {
    const story = this.create(storyId);
    story.state.storySeed = seed;
    story.ChoosePathString(knot);
    return this.advance(storyId, knot, story);
  }

  public continue(session: DialogueSession): DialogueSession {
    const story = this.fromSession(session);
    if (!story.canContinue) throw new TypeError('INK_CONTINUE_UNAVAILABLE');
    return this.advance(session.storyId!, session.knot, story);
  }

  public choose(session: DialogueSession, choiceKey: string): DialogueSession {
    const story = this.fromSession(session);
    const index = Number(choiceKey);
    if (!Number.isSafeInteger(index) || index < 0 || index >= story.currentChoices.length) {
      throw new RangeError(`INK_CHOICE_UNKNOWN:${choiceKey}`);
    }
    const choice = story.currentChoices[index]!;
    const sourcePath = choice.sourcePath || choice.pathStringOnChoice || session.knot || 'root';
    const choiceIntents = this.decodeTags(choice.tags, sourcePath, this.takeIntentCounter(story));
    story.ChooseChoiceIndex(index);
    const advanced = this.advance(session.storyId!, session.knot, story);
    return { ...advanced, intents: [...choiceIntents, ...(advanced.intents ?? [])] };
  }

  public restore(storyId: string, serializedState: string): DialogueSession {
    const story = this.create(storyId);
    this.loadState(story, serializedState);
    return this.project(storyId, story.state.currentPathString, story, [], []);
  }

  public save(session: DialogueSession): string {
    if (session.mode !== 'ink' || session.serializedState === undefined) {
      throw new TypeError('INK_SESSION_INVALID');
    }
    return session.serializedState;
  }

  private create(storyId: string): Story {
    try {
      const compiled = this.loadStory(storyId);
      const story = new Story(typeof compiled === 'string' ? compiled : JSON.stringify(compiled));
      if (this.query) for (const name of [
        'get_flag', 'quest_stage', 'has_item', 'affinity',
      ] as const) story.BindExternalFunction(name, (...args: unknown[]) =>
        this.query!(name, args), true);
      this.intentCounters.set(story, 0);
      return story;
    } catch (error) {
      throw new TypeError(`INK_STORY_INVALID:${storyId}`, { cause: error });
    }
  }
  private fromSession(session: DialogueSession): Story {
    if (session.mode !== 'ink' || session.storyId === null || session.serializedState === undefined)
      throw new TypeError('INK_SESSION_INVALID');
    const story = this.create(session.storyId);
    this.loadState(story, session.serializedState);
    return story;
  }

  private advance(storyId: string, knot: string | null, story: Story): DialogueSession {
    const lines: DialogueLine[] = [];
    let intents: readonly DialogueTagIntent[] = [];
    if (story.canContinue) {
      const sourcePath = story.state.currentPathString ?? knot ?? 'root';
      const visitCounter = this.takeIntentCounter(story);
      const text = story.Continue();
      intents = this.decodeTags(story.currentTags, sourcePath, visitCounter);
      if (text !== null && text.length > 0) lines.push({
        speakerId: this.speaker(intents), textKey: text,
      });
    }
    return this.project(storyId, knot, story, lines, intents);
  }
  private speaker(intents: readonly DialogueTagIntent[]): string {
    for (const intent of intents)
      if (intent.action.op === 'dialogue/speaker') return intent.action.speaker;
    return 'narrator';
  }
  private decodeTags(tags: readonly string[] | null, sourcePath: string, visitCounter: number):
  readonly DialogueTagIntent[] {
    return (tags ?? []).flatMap((tag, tagOrdinal) => {
      const normalized = tag.trim();
      return normalized.startsWith('ts:') ? [{ action: decodeInkAction(normalized),
        sourcePath, visitCounter, tagOrdinal }] : [];
    });
  }
  private takeIntentCounter(story: Story): number {
    const counter = this.intentCounters.get(story) ?? 0;
    this.intentCounters.set(story, counter + 1);
    return counter;
  }
  private loadState(story: Story, serializedState: string): void {
    const parsed = JSON.parse(serializedState) as Record<string, unknown>;
    const counter = parsed[INTENT_COUNTER_KEY];
    delete parsed[INTENT_COUNTER_KEY];
    story.state.LoadJson(JSON.stringify(parsed));
    this.intentCounters.set(story, Number.isSafeInteger(counter) && Number(counter) >= 0
      ? Number(counter) : 0);
  }
  private saveState(story: Story): string {
    const parsed = JSON.parse(story.state.ToJson()) as Record<string, unknown>;
    parsed[INTENT_COUNTER_KEY] = this.intentCounters.get(story) ?? 0;
    return JSON.stringify(parsed);
  }

  private project(
    storyId: string, knot: string | null, story: Story, lines: readonly DialogueLine[],
    intents: readonly DialogueTagIntent[],
  ): DialogueSession {
    return {
      mode: 'ink', storyId, knot, lines,
      choices: story.currentChoices.map((choice) => ({
        key: String(choice.index), textKey: choice.text,
      })),
      canContinue: story.canContinue,
      intents,
      serializedState: this.saveState(story),
    };
  }
}

/** Deterministic placeholder until an inkjs adapter is injected by the host. */
export class StubInkDialogueBridge implements InkDialogueBridge {
  public start(storyId: string, knot: string, _seed: number): DialogueSession {
    void storyId; void knot; void _seed;
    throw new TypeError('INK_ADAPTER_REQUIRED');
  }
  public continue(_session: DialogueSession): DialogueSession {
    throw new TypeError('INK_ADAPTER_REQUIRED');
  }
  public choose(_session: DialogueSession, _choiceKey: string): DialogueSession {
    throw new TypeError('INK_ADAPTER_REQUIRED');
  }
  public restore(_storyId: string, _serializedState: string): DialogueSession {
    throw new TypeError('INK_ADAPTER_REQUIRED');
  }
  public save(_session: DialogueSession): string { throw new TypeError('INK_ADAPTER_REQUIRED'); }
}

export function startDialogue(
  node: Extract<StoryNode, { type: 'dialogue' }>,
  bridge: InkDialogueBridge = new StubInkDialogueBridge(),
  seed = 0,
): DialogueSession {
  if ('inlineLines' in node.payload) {
    return { mode: 'inline', storyId: null, knot: null,
      lines: node.payload.inlineLines, choices: [] };
  }
  return bridge.start(node.payload.ink.storyId, node.payload.ink.knot, seed);
}
