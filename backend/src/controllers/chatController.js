/**
 * Saved Chat Controller
 * (chatController.js)
 */

const chatService = require('../services/chatService');

class ChatController {
  async saveChat(req, res, next) {
    try {
      const sessionUser = req.sessionUser;
      const { roomId, title } = req.body;

      const saved = await chatService.saveChat(sessionUser.sessionId, roomId, title);

      res.status(201).json({
        success: true,
        message: 'Conversation saved successfully',
        data: saved
      });
    } catch (err) {
      next(err);
    }
  }

  async getSavedChats(req, res, next) {
    try {
      const sessionUser = req.sessionUser;
      const chats = await chatService.getSavedChats(sessionUser.sessionId);

      res.status(200).json({
        success: true,
        data: chats
      });
    } catch (err) {
      next(err);
    }
  }

  async getSavedChatById(req, res, next) {
    try {
      const { id } = req.params;
      const sessionUser = req.sessionUser;
      const chat = await chatService.getSavedChatById(id, sessionUser.sessionId);

      res.status(200).json({
        success: true,
        data: chat
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteSavedChat(req, res, next) {
    try {
      const { id } = req.params;
      const sessionUser = req.sessionUser;

      await chatService.deleteSavedChat(id, sessionUser.sessionId);

      res.status(200).json({
        success: true,
        message: 'Saved chat deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ChatController();
