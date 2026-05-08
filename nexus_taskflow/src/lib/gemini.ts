export const models = {
  flash: 'gemini-1.5-flash',
  pro: 'gemini-1.5-pro',
};

export const nexusAI = {
  chat: async (messages: { role: string; content: string }[], systemInstruction: string) => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemInstruction }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect to Nexus AI');
    }

    return await response.json();
  }
};
