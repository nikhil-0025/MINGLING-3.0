/**
 * Session Controller
 * (sessionController.js)
 */

const sessionService = require('../services/sessionService');

class SessionController {
  async createSession(req, res, next) {
    try {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const { nickname } = req.body;
      const session = await sessionService.createSession(clientIp, nickname);

      res.status(201).json({
        success: true,
        message: 'Temporary session created successfully',
        data: session
      });
    } catch (err) {
      next(err);
    }
  }

  async getSession(req, res, next) {
    try {
      const sessionId = req.sessionUser.sessionId;
      const session = await sessionService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Active session not found'
        });
      }

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSession(req, res, next) {
    try {
      const sessionId = req.sessionUser.sessionId;
      const { nickname } = req.body;

      if (!nickname) {
        return res.status(400).json({
          success: false,
          message: 'Nickname is required'
        });
      }

      const updated = await sessionService.updateNickname(sessionId, nickname);

      res.status(200).json({
        success: true,
        message: 'Nickname updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteSession(req, res, next) {
    try {
      const sessionId = req.sessionUser.sessionId;
      await sessionService.terminateSession(sessionId);

      res.status(200).json({
        success: true,
        message: 'Session terminated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SessionController();
