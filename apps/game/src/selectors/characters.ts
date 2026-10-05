import type { CharacterState } from '@tianshu/core';
import type { CharacterDetailView, CharacterView } from '@tianshu/ui';
import type { GameContent } from '../runtime/content';
import type { SessionSnapshot } from '../runtime/contracts';

export function projectCharacter(character: CharacterState, content: GameContent): CharacterDetailView {
  const opened = new Set(character.meridians.opened);
  const meridians = content.topology.map((meridian) => {
    const stats = character.meridians.meridianStats[meridian.id];
    return { id: meridian.id, name: meridian.name, completed: meridian.points.every((point) => opened.has(point.id)),
      grade: stats?.grade ?? null, strength: stats?.strengthLayer ?? null, flux: stats?.fluxCap ?? null,
      points: meridian.points.map((point) => {
        const stat = character.meridians.acupointStats[point.id];
        return { ...point, opened: opened.has(point.id), grade: stat?.grade ?? null,
          strength: stat?.strengthLayer ?? null, flux: stat?.fluxCap ?? null };
      }) };
  });
  const labels = { hpMax: '生命上限', mpMax: '内力上限', strength: '力量', speed: '速度', tenacity: '韧性', coordination: '协调' };
  const innateLabels = { con: '根骨', str: '臂力', agi: '身法', wis: '悟性', wil: '定力', luk: '福缘', cha: '魅力' };
  return { stats: [...Object.entries(character.stats).map(([key, value]) => ({ key, label: labels[key as keyof typeof labels], value })),
    ...Object.entries(character.innate).map(([key, value]) => ({ key, label: innateLabels[key as keyof typeof innateLabels], value }))],
    skills: character.skills.map((skill) => {
      const definition = content.skills.find((entry) => entry.id === skill.skillId);
      return { id: skill.skillId, name: definition?.name ?? skill.skillId, layer: skill.trueLayer,
        grade: skill.attunedGrade ?? skill.sourceGrade, description: definition?.description ?? '' };
    }), meridians, opened: opened.size, completed: meridians.filter((row) => row.completed).length };
}
export function projectCharacters(session: SessionSnapshot, content: GameContent): readonly CharacterView[] {
  const protagonist = session.profile.protagonist;
  const self: CharacterView[] = protagonist ? [{ key: protagonist.characterId, name: '无名侠客', faction: '江湖散人',
    relation: 'self', affinity: null, biography: '此身入江湖，万卷待亲历。', portrait: null,
    detail: projectCharacter(protagonist, content) }] : [];
  const known = new Map(session.chapter.npcs.map((entry) => [entry.npcId, entry]));
  return [...self, ...content.npcs.map((npc, index): CharacterView => {
    const encounter = known.get(npc.id);
    if (!encounter) return { key: `unknown-${index}`, name: '未遇之人', faction: '身份未明',
      relation: 'unseen', affinity: null, biography: '行走江湖后，可记录此人的见闻。', portrait: null, detail: null };
    const appearance = npc.appearances.find((entry) => entry.chapterId === session.chapter.chapterId) ?? npc.appearances[0];
    const faction = appearance?.sects.map((entry) => content.factions[entry.sectId] ?? '门派待录').join(' · ') || '江湖人士';
    const companion = session.profile.companions.find((entry) => entry.characterId === npc.id);
    const character = companion ?? encounter.character;
    const works = npc.identity.sourceWorks ?? []; const sources = npc.sources ?? [];
    return { key: npc.id, name: npc.identity.name, faction, relation: encounter.relationship, affinity: encounter.affinity,
      biography: works.length > 0 || sources.length > 0
        ? `${works.length > 0 ? `见于《${works.join('》《')}》。` : ''}${sources.map((entry) => entry.locator).join('；')}`
        : '人物来历随章节正文逐步解锁。',
      portrait: content.assets?.[npc.id]?.portrait ?? null,
      detail: character ? projectCharacter(character, content) : null };
  })];
}
