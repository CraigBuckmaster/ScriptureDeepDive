import { buildGuidedStudyPlan } from '../plan';
import { GUIDED_STUDY_MODES } from '../types';
import { SAMPLE_CHAPTER_IDS, loadFixture } from './fixtures/sampleChapters';

describe.each(GUIDED_STUDY_MODES)('plan parity for mode=%s', (mode) => {
  it.each(SAMPLE_CHAPTER_IDS)('chapter %s', (chId) => {
    const input = loadFixture(chId, mode);
    const plan = buildGuidedStudyPlan(input);
    expect(plan).toMatchSnapshot();
  });
});
