/**
 * @deprecated Compatibility entrypoint for frozen fixtureVersion=2 recordings only.
 * Production rulesProtocol=3 evidence must drive MeridianFlowRuntime directly.
 */
export {
  runLegacyProtocol2Replay as runMeridianGoldenFixture,
  type LegacyProtocol2Inputs as MeridianGoldenInputs,
} from './legacy-protocol2-replay';
