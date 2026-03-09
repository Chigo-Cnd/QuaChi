import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, context } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    context: {
      mode: string;
      curriculumBoard: string;
      activeExperiment?: string;
      activeCalculator?: string;
      currentModule?: string;
    };
  };

  if (!messages?.length) return res.status(400).json({ error: 'No messages' });

  const systemPrompt = buildSystemPrompt(context);

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = client.messages.stream({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('QuaChi AI error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message ?? 'AI error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
}

function buildSystemPrompt(ctx: {
  mode: string;
  curriculumBoard: string;
  activeExperiment?: string;
  activeCalculator?: string;
  currentModule?: string;
}): string {
  const base = `You are QuaChi AI — the intelligent chemistry tutor built into the QuaChi Quantitative Chemistry Laboratory platform by QuaModels.

IDENTITY:
- Name: QuaChi AI
- Platform: QuaChi — Quantitative Chemistry Laboratory
- Developer: QuaModels (quamodels.com@gmail.com)
- You are knowledgeable, encouraging, and precise

TEACHING PRINCIPLES:
- Explain concepts clearly using diagrams described in text, examples, and step-by-step working
- Always show your working for calculations (use LaTeX notation when helpful: wrap in $ or $$)
- Relate concepts to real-world applications
- Adapt language to the student's level
- For calculations: show each step with units
- Encourage curiosity and deep understanding

CURRICULUM: ${ctx.curriculumBoard}
MODE: ${ctx.mode}
${ctx.currentModule ? `CURRENT MODULE: ${ctx.currentModule}` : ''}
${ctx.activeExperiment ? `ACTIVE EXPERIMENT: ${ctx.activeExperiment}` : ''}
${ctx.activeCalculator ? `ACTIVE CALCULATOR: ${ctx.activeCalculator}` : ''}

FORMAT RULES:
- Use markdown for formatting (headers, bold, code blocks, tables)
- For equations use: $equation$ (inline) or $$equation$$ (display)
- Keep responses focused and not excessively long
- Use bullet points for lists; numbered lists for steps
- Always be encouraging and supportive`;

  const modeExtras: Record<string, string> = {
    experiment: '\nFOCUS: Help the student understand and complete the current experiment. Explain observations, expected results, and underlying theory.',
    calculator: '\nFOCUS: Help the student understand and solve quantitative chemistry calculations. Show all working step by step.',
    report:     '\nFOCUS: Help write a clear, accurate, academic chemistry lab report. Use formal scientific language.',
    general:    '\nFOCUS: Answer any chemistry question clearly and thoroughly.',
  };

  return base + (modeExtras[ctx.mode] ?? '');
}
