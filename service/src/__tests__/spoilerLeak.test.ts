import { llmAdapter } from '../adapter/llmAdapter';
import { validateRecap, ValidationError } from '../validator/schemaValidator';
import { DEMO_EVENTS, DEMO_MATCH } from '../data/staticData';

describe('Spoiler-Free Guardrails Test Suite', () => {
  it('should generate a spoiler-free recap that does not mention final score or future goals', async () => {
    // Viewer joins at 40 seconds (Minute 22)
    const recap = await llmAdapter.generateRecap({
      matchId: DEMO_MATCH.id,
      nowSec: 40,
      spoilers: false,
      level: 'casual'
    });

    expect(recap.isSpoilerFree).toBe(true);
    expect(recap.bullets.length).toBeGreaterThanOrEqual(2);
    expect(recap.headline).toBeTruthy();

    const text = `${recap.headline} ${recap.bullets.join(' ')}`.toLowerCase();

    // Must NOT mention full time score of 3-2
    expect(text).not.toContain('3-2');
    expect(text).not.toContain('3 - 2');
    expect(text).not.toContain('final score');
    expect(text).not.toContain('full time');
    expect(text).not.toContain('full-time');

    // Future goal scorers like Haaland (scored at tSec 74), Foden (tSec 120), Rice (tSec 156), Trossard (tSec 168)
    // should NOT be mentioned as goalscorers
    expect(text).not.toContain('trossard scored');
    expect(text).not.toContain('rice scored');
    expect(text).not.toContain('foden scored');
  });

  it('validator should strictly reject spoiler leaks when spoilers=false', () => {
    const leakyData = {
      headline: 'Arsenal takes early lead',
      bullets: [
        'Saka scores in minute 19.',
        'Exciting start to the half.',
        'Arsenal eventually won 3-2 at full time.' // LEAK!
      ]
    };

    expect(() => {
      validateRecap(leakyData, false, 40, DEMO_EVENTS);
    }).toThrow(ValidationError);
  });

  it('allows full-time outcome when spoilers=true', async () => {
    const recap = await llmAdapter.generateRecap({
      matchId: DEMO_MATCH.id,
      nowSec: 180,
      spoilers: true,
      level: 'casual'
    });

    expect(recap.isSpoilerFree).toBe(false);
    const text = `${recap.headline} ${recap.bullets.join(' ')}`.toLowerCase();
    expect(text).toContain('3-2');
  });
});
