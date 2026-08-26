/**
 * AI Assistant Service Layer (Google Gemini Integration & Local Heuristic Fallbacks)
 * (aiService.js)
 */

class AIService {
  async summarizeChat(messages = []) {
    if (!messages || messages.length === 0) {
      return 'No messages found in this room yet to summarize.';
    }

    const transcript = messages
      .filter(m => m.content && m.content.trim())
      .map(m => `${m.senderNickname || 'User'}: ${m.content}`)
      .join('\n');

    // Call Google Gemini API if key exists and is valid
    if (process.env.AI_API_KEY && process.env.AI_API_KEY !== 'sample_ai_key') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI chat assistant summarizing a real-time chat transcript. Provide a concise, clear summary formatted in markdown bullet points (3-4 bullet points):\n\n${transcript}`
              }]
            }]
          })
        });
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text.trim();
        }
      } catch (err) {
        console.warn('[AI SUMMARIZE WARN]', err.message);
      }
    }

    // High-quality Heuristic Summary Fallback when Gemini API key is unavailable
    const participants = Array.from(new Set(messages.map(m => m.senderNickname).filter(Boolean)));
    const totalMsgs = messages.length;
    const textMsgs = messages.filter(m => m.type === 'text' || !m.type);
    const mediaMsgs = messages.filter(m => m.type && m.type !== 'text');
    
    // Recent key message samples
    const sampleMsgs = textMsgs.slice(-3).map(m => `"${m.content.substring(0, 60)}${m.content.length > 60 ? '...' : ''}" (${m.senderNickname})`);

    let summaryText = `### 📊 Chat Conversation Overview\n\n`;
    summaryText += `* **Total Messages:** ${totalMsgs} (${textMsgs.length} text, ${mediaMsgs.length} shared media)\n`;
    summaryText += `* **Active Participants:** ${participants.join(', ') || 'Anonymous Users'}\n`;
    
    if (sampleMsgs.length > 0) {
      summaryText += `* **Recent Discussion Highlights:**\n`;
      sampleMsgs.forEach(sample => {
        summaryText += `  - ${sample}\n`;
      });
    }

    summaryText += `\n* **Privacy Note:** This temporary conversation will automatically self-destruct when the room timer expires.`;

    return summaryText;
  }

  async fixGrammar(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/\s+/g, ' ').trim() + (/[.!?]$/.test(text) ? '' : '.');
  }

  async translateText(text, targetLang = 'Spanish') {
    if (!text) return '';
    return `[Translated to ${targetLang}]: ${text}`;
  }

  async generateSmartReplies(lastMessageContent) {
    if (!lastMessageContent) return ['Sounds good!', 'Got it!', 'Thanks!'];
    return [
      `I agree with that!`,
      `Let me look into this.`,
      `Thanks for sharing!`
    ];
  }
}

module.exports = new AIService();
