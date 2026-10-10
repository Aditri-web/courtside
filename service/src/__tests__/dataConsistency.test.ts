import fs from 'fs';
import path from 'path';
import { DEMO_EVENTS, DEMO_MATCH } from '../data/staticData';

describe('Match Data Consistency Suite (Sync Verification)', () => {
  const sharedUiStaticDataPath = path.resolve(
    __dirname,
    '../../../packages/shared-ui/src/companion/staticData.ts'
  );

  it('shared-ui staticData.ts exists and is accessible', () => {
    expect(fs.existsSync(sharedUiStaticDataPath)).toBe(true);
  });

  it('verifies DEMO_EVENTS has all 31 chronological match events', () => {
    expect(DEMO_EVENTS).toHaveLength(31);

    // Verify chronological order
    for (let i = 1; i < DEMO_EVENTS.length; i++) {
      expect(DEMO_EVENTS[i].tSec).toBeGreaterThanOrEqual(DEMO_EVENTS[i - 1].tSec);
    }
  });

  it('verifies shared-ui staticData contains identical event IDs and timestamps', () => {
    const fileContent = fs.readFileSync(sharedUiStaticDataPath, 'utf8');

    for (const event of DEMO_EVENTS) {
      expect(fileContent).toContain(`id: '${event.id}'`);
      expect(fileContent).toContain(`tSec: ${event.tSec}`);
      expect(fileContent).toContain(`clock: "${event.clock}"`);
    }
  });

  it('verifies match IDs and teams are synchronized between service and shared-ui', () => {
    const fileContent = fs.readFileSync(sharedUiStaticDataPath, 'utf8');

    expect(fileContent).toContain(`id: '${DEMO_MATCH.id}'`);
    expect(fileContent).toContain(`name: '${DEMO_MATCH.home.name}'`);
    expect(fileContent).toContain(`name: '${DEMO_MATCH.away.name}'`);
  });
});
