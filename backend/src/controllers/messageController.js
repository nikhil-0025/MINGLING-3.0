/**
 * Message Controller
 * (messageController.js)
 */

const messageService = require('../services/messageService');

class MessageController {
  async getRoomMessages(req, res, next) {
    try {
      const { id } = req.params;
      const messages = await messageService.getRoomMessages(id);

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const sessionUser = req.sessionUser;
      const { roomId, content, type, fileUrl, fileName, fileSize, mimeType, replyToMessageId } = req.body;

      const message = await messageService.createMessage({
        roomId,
        senderSessionId: sessionUser.sessionId,
        senderNickname: sessionUser.nickname,
        senderAvatar: sessionUser.avatar,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        replyToMessageId
      });

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (err) {
      next(err);
    }
  }

  async editMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const sessionUser = req.sessionUser;

      const updated = await messageService.editMessage(id, sessionUser.sessionId, content);

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      res.status(403).json({
        success: false,
        message: err.message
      });
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const { id } = req.params;
      const sessionUser = req.sessionUser;

      const result = await messageService.deleteMessage(id, sessionUser.sessionId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(403).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new MessageController();
