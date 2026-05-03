require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Secure API endpoint that proxies requests to Gemini
app.post('/api/analyze', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: API key missing.' });
        }

        const { state, computed } = req.body;

        const stressLabels = ['Low', 'Moderate', 'High', 'Critical'];
        const emotionLabels = ['Calm', 'Anxious', 'Agitated', 'Erratic'];

        const prompt = `You are VIGIL, an advanced AI-powered driver wellness intelligence system. Analyze the following biometric assessment data and provide a personalized safety briefing.

OPERATOR BIOMETRICS:
- Sleep in last 24h: ${state.sleep} hours
- Stress/Cortisol Level: ${stressLabels[state.stress - 1]}
- Psychological State: ${emotionLabels[state.emotion - 1]}
- Chemical Influence: ${state.meds.includes('none') ? 'None detected' : state.meds.join(', ')}

COMPUTED METRICS:
- Readiness Score: ${Math.round(computed.readiness)}/100
- Fatigue Index: ${computed.fatigue.toFixed(1)}/10
- Impairment Level: ${computed.impair.toFixed(1)}/10
- Emotional Load: ${computed.emotional.toFixed(1)}/10
- Anomalies Detected: ${computed.anomalies.length > 0 ? computed.anomalies.map(a => a.text).join('; ') : 'None'}

Provide a 3-4 sentence personalized safety briefing that:
1. Addresses the specific combination of risk factors detected
2. Provides an evidence-based assessment of how these factors compound to affect driving ability
3. Gives one specific, actionable recommendation

Be authoritative, clinical, and empathetic in tone. Do NOT use bullet points or lists. Write in flowing prose. Do NOT use markdown formatting. Keep it under 80 words.`;

        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Response:', errorText);
            throw new Error(`Gemini API responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Gemini API Full Response:', JSON.stringify(data, null, 2));
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis.';
        
        res.json({ analysis: textResponse });

    } catch (error) {
        console.error('Error generating analysis:', error);
        res.status(500).json({ error: 'Internal server error during analysis generation.' });
    }
});



app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`🚀 VIGIL Secure Backend Engine Started`);
    console.log(`📡 Listening on http://localhost:${PORT}`);
    console.log(`🔒 Gemini API Key loaded from .env: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
    console.log(`===========================================\n`);
});

module.exports = app;
