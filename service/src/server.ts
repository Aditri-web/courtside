import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEMO_MATCH, DEMO_EVENTS, ALL_MATCHES } from './data/staticData';
import { llmAdapter } from './adapter/llmAdapter';
import { RecapRequest, ExplainRequest, AskRequest } from './types';
import { globalCache } from './cache/responseCache';

dotenv.config();

export const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[CourtSide-AI] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ------------------------------------------------------------------
// Health check
// ------------------------------------------------------------------
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CourtSide AI Companion Service',
    version: '2.0.0',
    provider: process.env.LLM_PROVIDER || 'mock',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    cacheEntries: globalCache.size(),
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------------------------------------
// Match metadata
// ------------------------------------------------------------------
app.get('/match', (req: Request, res: Response) => {
  const matchId = (req.query.id as string) || DEMO_MATCH.id;
  const match = ALL_MATCHES.find((m) => m.id === matchId) || DEMO_MATCH;
  res.json(match);
});

app.get('/matches', (req: Request, res: Response) => {
  res.json(ALL_MATCHES);
});

// ------------------------------------------------------------------
// Feature 1: Catch Me Up (Recap)
// ------------------------------------------------------------------
app.post('/recap', async (req: Request, res: Response) => {
  try {
    const { matchId, nowSec, spoilers, level } = req.body as RecapRequest;
    const recap = await llmAdapter.generateRecap({
      matchId: matchId || DEMO_MATCH.id,
      nowSec: Number(nowSec ?? 180),
      spoilers: Boolean(spoilers),
      level: level || 'casual'
    });
    res.json(recap);
  } catch (error) {
    console.error('Error generating recap:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ------------------------------------------------------------------
// Feature 2: Explain This
// ------------------------------------------------------------------
app.post('/explain', async (req: Request, res: Response) => {
  try {
    const { matchId, eventId, tSec, level } = req.body as ExplainRequest;
    const explanation = await llmAdapter.generateExplain({
      matchId: matchId || DEMO_MATCH.id,
      eventId,
      tSec: tSec !== undefined ? Number(tSec) : undefined,
      level: level || 'casual'
    });
    res.json(explanation);
  } catch (error) {
    console.error('Error explaining play:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ------------------------------------------------------------------
// Feature 3: Key Moments
// ------------------------------------------------------------------
app.get('/moments', async (req: Request, res: Response) => {
  try {
    const matchId = (req.query.matchId as string) || DEMO_MATCH.id;
    const moments = await llmAdapter.generateMoments(matchId);
    res.json(moments);
  } catch (error) {
    console.error('Error fetching moments:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/moments', async (req: Request, res: Response) => {
  try {
    const matchId = (req.body.matchId as string) || DEMO_MATCH.id;
    const moments = await llmAdapter.generateMoments(matchId);
    res.json(moments);
  } catch (error) {
    console.error('Error fetching moments:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ------------------------------------------------------------------
// Feature 4: Ask CourtSide
// ------------------------------------------------------------------
app.post('/ask', async (req: Request, res: Response) => {
  try {
    const { matchId, question, nowSec, level } = req.body as AskRequest;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question is required' });
      return;
    }
    const answer = await llmAdapter.generateAsk({
      matchId: matchId || DEMO_MATCH.id,
      question: question.trim(),
      nowSec: Number(nowSec ?? 180),
      level: level || 'casual'
    });
    res.json(answer);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ------------------------------------------------------------------
// Feature 5: Live Event Feed (tied to playback timeline)
// ------------------------------------------------------------------
app.get('/live', (req: Request, res: Response) => {
  const nowSec = Number(req.query.nowSec ?? 180);
  const visibleEvents = DEMO_EVENTS.filter((e) => e.tSec <= nowSec);
  const latestEvent = visibleEvents[visibleEvents.length - 1];

  res.json({
    matchId: DEMO_MATCH.id,
    nowSec,
    events: visibleEvents,
    latestEvent
  });
});

// ------------------------------------------------------------------
// Feature 6: SSE stream — real-time event ticker for UI subscriptions
// Clients: GET /stream?nowSec=180
// Sends one SSE event per second with the current live state.
// This enables the companion UI to auto-update without polling.
// ------------------------------------------------------------------
app.get('/stream', (req: Request, res: Response) => {
  const nowSecStart = Number(req.query.nowSec ?? 0);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  let currentSec = nowSecStart;
  const maxSec = DEMO_MATCH.durationSec || 600;

  function sendTick() {
    const visibleEvents = DEMO_EVENTS.filter((e) => e.tSec <= currentSec);
    const latestEvent = visibleEvents[visibleEvents.length - 1];
    const data = JSON.stringify({
      matchId: DEMO_MATCH.id,
      nowSec: currentSec,
      latestEvent: latestEvent ?? null,
      eventCount: visibleEvents.length
    });
    res.write(`data: ${data}\n\n`);
    currentSec++;
  }

  sendTick(); // immediate first tick
  const interval = setInterval(() => {
    if (currentSec > maxSec) {
      res.write(`event: end\ndata: {"reason":"match-complete"}\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }
    sendTick();
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// ------------------------------------------------------------------
// Feature 7: Cache invalidation (useful for demo resets)
// ------------------------------------------------------------------
app.delete('/cache', (req: Request, res: Response) => {
  globalCache.clear();
  res.json({ cleared: true, timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`===============================================`);
    console.log(` CourtSide AI Service v2.0`);
    console.log(` http://localhost:${port}`);
    console.log(` Provider: ${process.env.LLM_PROVIDER || 'mock'}`);
    console.log(` Gemini: ${process.env.GEMINI_API_KEY ? 'ENABLED ✓' : 'offline (set GEMINI_API_KEY)'}`);
    console.log(`===============================================`);
  });
}
