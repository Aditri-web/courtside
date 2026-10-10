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
    // Asked at 30 seconds before any goal was scored
    const response = await llmAdapter.generateAsk({
      matchId: DEMO_MATCH.id,
      question: 'Did Manchester City score yet?',
      nowSec: 50
    });

    expect(response.grounded).toBe(true);
    expect(response.answer.toLowerCase()).toContain('not scored yet');
  });
});
