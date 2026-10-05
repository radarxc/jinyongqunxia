import assert from 'node:assert/strict';
import { compileStorySources, formatStoryDiagnostic } from './compile_story';

function story(fragment: string): string {
  return `schemaVersion: story.v1
chapterId: ch01_tianlong
lineId: main
kind: main
titleKey: story.test
eraLayer: ch01
startNodeId: n_start
sideHooks: []
source: {document: fixture, anchors: [test]}
nodes:
  - id: n_start
    type: condition
    titleKey: story.test.start
    completeOn: immediate
    payload:
      expression: ${fragment}
    sourceRef: fixture
  - id: n_end
    type: end
    titleKey: story.test.end
    completeOn: immediate
    payload: {endingTags: [done]}
    sourceRef: fixture
edges:
  - {id: e_done, from: n_start, to: n_end, trigger: auto, priority: 0}
`;
}

function testValidCondition(): void {
  const result = compileStorySources([{ path: 'content/story/ch01/valid.yaml',
    text: story('{flag: {id: fl_test, is: true}}') }]);
  assert.equal(result.storyCount, 1); assert.equal(result.chapterCount, 1);
  assert.deepEqual(result.diagnostics, []);
}
function testInvalidCondition(): void {
  const result = compileStorySources([{ path: 'content/story/ch01/bad-condition.yaml',
    text: story('{unknown: {id: fl_test}}') }]);
  assert.equal(result.diagnostics.length, 1);
  assert.deepEqual(result.diagnostics[0], {
    file: 'content/story/ch01/bad-condition.yaml', line: 16, column: 19,
    code: 'CONDITION_OPERATOR', message: 'CONDITION_OPERATOR:unknown',
  });
  assert.match(formatStoryDiagnostic(result.diagnostics[0]!),
    /^content\/story\/ch01\/bad-condition.yaml:16:19 error CONDITION_OPERATOR/u);
}
function testInvalidAction(): void {
  const text = story('{flag: {id: fl_test, is: true}}').replace(
    'type: condition\n    titleKey', 'type: quest\n    titleKey').replace(
      'payload:\n      expression: {flag: {id: fl_test, is: true}}',
      'payload:\n      inlineEvent:\n        eventKey: invalid_action\n        actions:\n          - {id: fx_bad, op: typo/action}');
  const result = compileStorySources([{ path: 'content/story/ch01/bad-action.yaml', text }]);
  assert.equal(result.diagnostics.length, 1);
  assert.deepEqual(result.diagnostics[0], {
    file: 'content/story/ch01/bad-action.yaml', line: 19, column: 30,
    code: 'STORY_ACTION', message: "Invalid discriminator value. Expected 'flag/set' | " +
      "'flag/clear' | 'battle/start' | 'reward/item' | 'learnSource/unlock' | " +
      "'dialogue/start' | 'reward/exp' | 'reward/fame' | 'reward/morality' | " +
      "'sect/claimRank' | 'quest/advance'",
  });
  assert.match(formatStoryDiagnostic(result.diagnostics[0]!),
    /^content\/story\/ch01\/bad-action.yaml:19:30 error STORY_ACTION/u);
}
function testInvalidYamlPosition(): void {
  const text = story('{flag: {id: fl_test, is: true}}').replace(
    '    titleKey: story.test.start', '    titleKey story.test.start');
  const result = compileStorySources([{ path: 'content/story/ch01/bad-yaml.yaml', text }]);
  assert.equal(result.diagnostics.length, 1);
  assert.deepEqual(result.diagnostics[0], {
    file: 'content/story/ch01/bad-yaml.yaml', line: 13, column: 5,
    code: 'CONTENT_YAML',
    message: result.diagnostics[0]?.message,
  });
  assert.match(result.diagnostics[0]!.message, /^CONTENT_YAML:/u);
}

testValidCondition();
testInvalidCondition();
testInvalidAction();
testInvalidYamlPosition();
console.log('content:test-compile-story: 4 tests passed');
