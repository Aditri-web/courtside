import request from 'supertest';
import { app } from '../server';

describe('CourtSide AI Service HTTP Endpoints', () => {
  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('CourtSide');
  });

  it('GET /demo returns interactive html demo dashboard', async () => {
    const res = await request(app).get('/demo');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('CourtSide AI');
  });

  it('GET /match returns match details', async () => {
    const res = await request(app).get('/match');
    expect(res.status).toBe(200);
    expect(res.body.title).toContain('Arsenal vs Manchester City');
    expect(res.body.events.length).toBeGreaterThan(20);
  });

  it('POST /recap produces valid JSON recap', async () => {
    const res = await request(app).post('/recap').send({
      matchId: 'match-ars-mci-2026',
      nowSec: 100,
      spoilers: false,
      level: 'casual'
    });

    expect(res.status).toBe(200);
    expect(res.body.headline).toBeTruthy();
    expect(Array.isArray(res.body.bullets)).toBe(true);
    expect(res.body.isSpoilerFree).toBe(true);
  });

  it('POST /explain returns play breakdown', async () => {
    const res = await request(app).post('/explain').send({
      matchId: 'match-ars-mci-2026',
      eventId: 'ev-06',
      level: 'expert'
    });

    expect(res.status).toBe(200);
    expect(res.body.eventId).toBe('ev-06');
    expect(res.body.explanation).toBeTruthy();
  });

  it('GET /moments returns ranked match events', async () => {
    const res = await request(app).get('/moments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.moments)).toBe(true);
    expect(res.body.moments.length).toBeGreaterThan(0);
    expect(res.body.moments[0].tSec).toBeDefined();
  });

  it('POST /ask answers question', async () => {
    const res = await request(app).post('/ask').send({
      matchId: 'match-ars-mci-2026',
      question: 'Who scored first?',
      nowSec: 180
    });

    expect(res.status).toBe(200);
    expect(res.body.answer).toBeTruthy();
    expect(res.body.grounded).toBe(true);
  });

  it('GET /live filters events by playback seconds', async () => {
    const res = await request(app).get('/live?nowSec=50');
    expect(res.status).toBe(200);
    expect(res.body.nowSec).toBe(50);
    expect(res.body.events.every((e: any) => e.tSec <= 50)).toBe(true);
  });
});
