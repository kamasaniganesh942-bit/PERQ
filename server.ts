import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatINRServer(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return inrFormatter.format(safe);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Optional server-side Gemini API endpoint for Smart Pick AI explanation in INR (₹)
  app.post('/api/smart-pick-insight', async (req, res) => {
    const {
      merchantName,
      amount,
      category,
      recommendedCardName,
      recommendedRate,
      estimatedReward,
      runnerUpCardName,
      runnerUpReward,
    } = req.body || {};

    if (!merchantName || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Valid merchant name and positive purchase amount in INR are required.' });
      return;
    }

    const formattedAmount = formatINRServer(amount);
    const formattedReward = formatINRServer(Number(estimatedReward || 0));
    const formattedRunnerUp = formatINRServer(Number(runnerUpReward || 0));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        source: 'formula-fallback',
        insight: `Paying ${formattedAmount} at ${merchantName} (${category}) with your ${recommendedCardName} card applies a ${recommendedRate}% reward rate for an estimated ${formattedReward} return${runnerUpCardName ? `—outperforming ${runnerUpCardName} (${formattedRunnerUp} estimated)` : ''}. Configure GEMINI_API_KEY on the server to enable live AI commentary.`,
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are a concise, transparent financial assistant inside the PERQ card & reward optimization app in India.
A user is evaluating a purchase of ${formattedAmount} (Indian Rupees, INR) at "${merchantName}" in the "${category}" category.
Based on configured card reward rates:
- Recommended Card: ${recommendedCardName} (${recommendedRate}% reward rate, estimated ${formattedReward} reward)
- Next Best Card: ${runnerUpCardName || 'None'} (estimated ${formattedRunnerUp} reward)

Write a clear, helpful 2-sentence explanation using Indian Rupees (₹) of why ${recommendedCardName} wins mathematically for this ${category} purchase and remind the user that these figures are simulated reward estimates rather than verified bank offers. Do not use the word "demo". Plain text only, no markdown bullets.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      res.json({
        source: 'gemini',
        insight:
          text ||
          `Using ${recommendedCardName} at ${recommendedRate}% yields an estimated ${formattedReward} reward on this ${formattedAmount} ${category} purchase.`,
      });
    } catch {
      res.json({
        source: 'formula-fallback',
        insight: `Based on PERQ's reward formula (${formattedAmount} × ${recommendedRate}%), ${recommendedCardName} delivers the highest return of ${formattedReward} for ${category} spending${runnerUpCardName ? `, ahead of ${runnerUpCardName} (${formattedRunnerUp})` : ''}. Note: All rates are simulated estimates in Indian Rupees (₹).`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PERQ server listening on http://localhost:${PORT}`);
  });
}

startServer();
