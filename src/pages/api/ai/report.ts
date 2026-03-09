import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { experiment, observations, dataPoints, curriculumBoard } = req.body;

  try {
    const prompt = `Generate a complete academic chemistry lab report for the following experiment.

EXPERIMENT: ${experiment.title}
CURRICULUM: ${curriculumBoard}
OBJECTIVE: ${experiment.objectives?.join('; ')}
APPARATUS: ${experiment.apparatus?.join(', ')}
CHEMICALS: ${experiment.chemicals?.map((c: any) => `${c.name} (${c.formula})`).join(', ')}
OBSERVATIONS: ${observations?.join('\n') || 'Standard observations as expected for this experiment'}
KEY EQUATIONS: ${experiment.keyEquations?.join('\n') || 'See experiment theory'}

Write a complete lab report with these sections:
1. OBJECTIVE
2. INTRODUCTION (theory and background, ~150 words)
3. APPARATUS
4. CHEMICALS AND REAGENTS
5. PROCEDURE (numbered steps)
6. RESULTS AND OBSERVATIONS (include data table if appropriate)
7. CALCULATIONS (show working with equations)
8. DISCUSSION (explain results, compare with theory, sources of error)
9. CONCLUSION (summary of findings)
${curriculumBoard === 'IB' ? '10. EVALUATION (IB-style: systematic errors, random errors, improvements)' : ''}
11. REFERENCES

Use formal scientific language. Show all calculations with units. Reference key equations.
Format each section with a clear heading in CAPS.`;

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages:   [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    // Parse sections
    const sections: Record<string, string> = {};
    const sectionNames = [
      'OBJECTIVE', 'INTRODUCTION', 'APPARATUS', 'CHEMICALS', 'PROCEDURE',
      'RESULTS', 'CALCULATIONS', 'DISCUSSION', 'CONCLUSION', 'EVALUATION', 'REFERENCES'
    ];

    let current = '';
    const lines = text.split('\n');
    for (const line of lines) {
      const upper = line.trim().toUpperCase();
      const matched = sectionNames.find(s => upper.startsWith(s));
      if (matched) {
        current = matched.toLowerCase();
        sections[current] = '';
      } else if (current) {
        sections[current] = (sections[current] ?? '') + line + '\n';
      }
    }

    res.json({ report: sections, fullText: text });
  } catch (err: any) {
    console.error('Report generation error:', err);
    res.status(500).json({ error: err.message });
  }
}
