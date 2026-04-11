export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { system, messages } = req.body;

    if (!system || !messages) {
        return res.status(400).json({ message: 'Missing system or messages' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 300,
                system,
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