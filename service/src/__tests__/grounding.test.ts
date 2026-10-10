import { llmAdapter } from '../adapter/llmAdapter';
import { DEMO_MATCH } from '../data/staticData';

describe('Grounded Question Answering Tests', () => {
  it('correctly answers grounded match question with sourced eventId', async () => {
    const response = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Who scored the first goal?',
      nowSec: 180
    });

    expect(response.grounded).toBe(true);
    expect(response.answer.toLowerCase()).toContain('saka');
    expect(response.sources).toContain('ev-06');
  });

  it('safely rejects unanswerable / out of domain questions', async () => {
    const response = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Who will win the Premier League trophy at the end of the season?',
      nowSec: 180
    });

    expect(response.grounded).toBe(false);
    expect(response.answer).toBe("I don't have that information from the match data.");
  });

  it('respects playback time boundary in questions', async () => {
    // Asked at 50 seconds before City goal at tSec 74
    const response = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Did Manchester City score yet?',
      nowSec: 50
    });

    expect(response.grounded).toBe(true);
    expect(response.answer.toLowerCase()).toContain('not scored yet');
  });

  it('prevents goal, VAR, and card spoiler leaks when asked before they occur', async () => {
    // Asked at 10 seconds before Saka goal at tSec 34
    const goalEarly = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Who scored the first goal?',
      nowSec: 10
    });
    expect(goalEarly.answer.toLowerCase()).toContain('no goals have been scored yet');
    expect(goalEarly.sources).toHaveLength(0);

    // Asked at 30 seconds before VAR at tSec 90
    const varEarly = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Did VAR review any penalty?',
      nowSec: 30
    });
    expect(varEarly.answer.toLowerCase()).toContain('no var reviews');
    expect(varEarly.sources).toHaveLength(0);

    // Asked at 20 seconds before first yellow card at tSec 40
    const cardEarly = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Who got yellow cards?',
      nowSec: 20
    });
    expect(cardEarly.answer.toLowerCase()).toContain('no yellow cards have been issued yet');
    expect(cardEarly.sources).toHaveLength(0);
  });
});
