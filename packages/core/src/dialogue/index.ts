import type { StoryNode } from '@tianshu/data/schemas';
import { Story } from 'inkjs/engine/Story';
export * from './state';

export interface DialogueLine { readonly speakerId: string; readonly textKey: string; }
export interface DialogueChoice { readonly key: string; readonly textKey: string; }
export interface DialogueSession {
  readonly mode: 'inline' | 'ink'; readonly storyId: string | null; readonly knot: string | null;
  readonly lines: readonly DialogueLine[]; readonly choices: readonly DialogueChoice[];
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

/** inkjs runtime adapter; compilation and story asset lookup stay with the host. */
export class InkJsDialogueBridge implements InkDialogueBridge {
  public constructor(private readonly loadStory: InkStoryLoader) {}

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
    story.ChooseChoiceIndex(index);
    return this.advance(session.storyId!, session.knot, story);
  }

  public restore(storyId: string, serializedState: string): DialogueSession {
    const story = this.create(storyId);
    story.state.LoadJson(serializedState);
    return this.project(storyId, story.state.currentPathString, story, []);
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
      return new Story(typeof compiled === 'string' ? compiled : JSON.stringify(compiled));
    } catch (error) {
      throw new TypeError(`INK_STORY_INVALID:${storyId}`, { cause: error });
    }
  }
  private fromSession(session: DialogueSession): Story {
    if (session.mode !== 'ink' || session.storyId === null || session.serializedState === undefined)
      throw new TypeError('INK_SESSION_INVALID');
    const story = this.create(session.storyId);
    story.state.LoadJson(session.serializedState);
    return story;
  }

  private advance(storyId: string, knot: string | null, story: Story): DialogueSession {
    const lines: DialogueLine[] = [];
    if (story.canContinue) {
      const text = story.Continue();
      if (text !== null && text.length > 0) lines.push({
        speakerId: this.speaker(story.currentTags ?? []), textKey: text,
      });
    }
    return this.project(storyId, knot, story, lines);
  }
  private speaker(tags: readonly string[]): string {
    for (const tag of tags) {
      const match = tag.trim().match(/^ts:dialogue\/speaker\s+speaker=(npc_[a-z0-9_]+|player|narrator|book_spirit)$/u);
      if (match) return match[1]!;
    }
    return 'narrator';
  }

  private project(
    storyId: string, knot: string | null, story: Story, lines: readonly DialogueLine[],
  ): DialogueSession {
    return {
      mode: 'ink', storyId, knot, lines,
      choices: story.currentChoices.map((choice) => ({
        key: String(choice.index), textKey: choice.text,
      })),
      canContinue: story.canContinue,
      serializedState: story.state.ToJson(),
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
