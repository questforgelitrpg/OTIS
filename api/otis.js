const MAX_ALLOWED_TOKENS = 500;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { system, messages, maxTokens } = req.body;

    if (!system || !messages) {
        return res.status(400).json({ message: 'Missing system or messages' });
    }

    // Wrap system prompt as a cacheable content block if it's a plain string.
    // The prompt-caching beta requires the array format with cache_control.
    const systemBlock = typeof system === 'string'
        ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
        : system;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'prompt-caching-2024-07-31',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: (typeof maxTokens === 'number' && maxTokens > 0 && maxTokens <= MAX_ALLOWED_TOKENS)
                    ? maxTokens : 250,
                temperature: 1.0,
                top_p: 0.95,
                system: systemBlock,
                messages,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: 'Anthropic API error', details: errorData });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}