import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', authenticateToken, async (req, res) => {
  const { prompt, maxTokens = 300 } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    console.log('AI response:', JSON.stringify(data).slice(0, 200));
    res.json({ text: data.content?.[0]?.text || 'No response' });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;
