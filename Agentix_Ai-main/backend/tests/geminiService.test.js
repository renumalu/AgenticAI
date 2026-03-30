const geminiService = require('../src/services/geminiService');

describe('GeminiService', () => {
    test('generateResponse should return a string', async () => {
        // Since we don't have AWS keys in test environment, it will return mock
        const response = await geminiService.generateResponse('Hello');
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
    });

    test('summarizeDocument should contain mock prefix if no keys', async () => {
        const response = await geminiService.summarizeDocument('Sample text');
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            expect(response).toContain('Based on your recent activity');
        }
    });

    test('generateTasks should return an array', async () => {
        const tasks = await geminiService.generateTasks('Sample text');
        expect(Array.isArray(tasks)).toBe(true);
        if (tasks.length > 0) {
            expect(tasks[0]).toHaveProperty('title');
        }
    });
});
