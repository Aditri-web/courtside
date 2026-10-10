import { llmAdapter } from '../adapter/llmAdapter';
import { DEMO_MATCH, DEMO_EVENTS } from '../data/staticData';

describe('Explanation Level Differentiation Tests', () => {
  const goalEvent = DEMO_EVENTS[5]; // Saka goal (ev-06)

  it('Kid level uses simple language and energetic tone', async () => {
    const explain = await llmAdapter.generateExplain({
      matchId: DEMO_MATCH.id,
      eventId: goalEvent.id,
      level: 'kid'
    });

    expect(explain.level).toBe('kid');
    expect(explain.explanation).toBeTruthy();

    const text = explain.explanation.toLowerCase();
    // Kid explanation uses friendly words or fun tone
    expect(text.length).toBeGreaterThan(20);
    // Should NOT contain complex tactical jargon
    expect(text).not.toContain('half-spaces');
    expect(text).not.toContain('inverted full-back');
    expect(text).not.toContain('xg');
  });

  it('Expert level incorporates tactical and positional insights', async () => {
    const explain = await llmAdapter.generateExplain({
      matchId: DEMO_MATCH.id,
      eventId: goalEvent.id,
      level: 'expert'
    });

    expect(explain.level).toBe('expert');
    expect(explain.explanation).toBeTruthy();
    expect(explain.ruleSnippet || explain.tacticalNote).toBeTruthy();

    const combined = `${explain.explanation} ${explain.tacticalNote || ''}`.toLowerCase();
    expect(
      combined.includes('tactical') ||
        combined.includes('positional') ||
        combined.includes('defensive') ||
        combined.includes('separation') ||
        combined.includes('half-space')
    ).toBe(true);
  });
});
