/**
 * AI Controller
 * (aiController.js)
 */

const aiService = require('../services/aiService');
const messageService = require('../services/messageService');

class AIController {
  async summarizeRoom(req, res, next) {
    try {
      const { roomId } = req.body;
      if (!roomId) {
        return res.status(400).json({ success: false, message: 'Room ID is required' });
      }

      const messages = await messageService.getRoomMessages(roomId);
      const summary = await aiService.summarizeChat(messages);

      res.status(200).json({
        success: true,
        data: { summary }
      });
    } catch (err) {
      next(err);
    }
  }

  async grammarCheck(req, res, next) {
    try {
      const { text } = req.body;
      const corrected = await aiService.fixGrammar(text);

      res.status(200).json({
        success: true,
        data: { corrected }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
