
import { db } from '../services/db.js';
import {} from '../middleware/authMiddleware.js';

export const attendanceController = {
  // Member self-service check-in with Member ID + Password authentication
  checkIn(req, res) {
    const memberId = req.body.memberId || req.user?.memberId;
    const password = req.body.password;

    if (!memberId || !password) {
      res.status(400).json({ error: 'Member ID and password are required for attendance verification.' });
      return;
    }

    // If request has logged-in user, ensure they can only check in for themselves
    if (req.user && req.user.memberId && req.user.memberId.toUpperCase() !== String(memberId).trim().toUpperCase()) {
      res.status(403).json({ error: 'You cannot submit attendance for another member.' });
      return;
    }

    const result = db.submitAttendance(String(memberId).trim(), String(password));
    if (!result.success) {
      res.status(400).json({ error: result.message, status: result.status, record: result.record });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      record: result.record,
      status: result.status
    });
  },

  // Check whether an attendance window is currently open & member's status for today
  getStatus(req, res) {
    const activeWindow = db.getActiveAttendanceSession();
    let checkedInToday = false;
    let todayRecord = null;

    if (req.user) {
      const records = db.getMemberAttendance(req.user.id);
      const todayStr = new Date().toISOString().split('T')[0];
      const found = records.find((r) => r.date === todayStr);
      if (found) {
        checkedInToday = true;
        todayRecord = found;
      }
    }

    res.json({
      isOpen: activeWindow.isOpen,
      session: activeWindow.session,
      minutesIntoSession: activeWindow.minutesIntoSession,
      expectedStatus: activeWindow.expectedStatus,
      message: activeWindow.message,
      checkedInToday,
      todayRecord,
      configs: db.getAttendanceSessionConfigs()
    });
  },

  // Member's verified attendance record and qualification rate
  getMyHistory(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const records = db.getMemberAttendance(req.user.id);
    const totalSessions = records.length;
    const presentSessions = records.filter((r) => r.status === 'Present').length;
    const lateSessions = records.filter((r) => r.status === 'Late').length;
    const attendanceRate = totalSessions > 0 ? Math.round(presentSessions / totalSessions * 100) : 100;
    const isCertificateEligible = attendanceRate >= 80;

    res.json({
      records,
      totalSessions,
      presentSessions,
      lateSessions,
      attendanceRate,
      isCertificateEligible
    });
  },

  // --- Admin endpoints ---
  getAll(req, res) {
    const records = db.getAllAttendanceRecords();
    res.json({ records });
  },

  createManual(req, res) {
    const record = db.createManualAttendanceRecord(req.body);
    res.json({ success: true, record });
  },

  deleteRecord(req, res) {
    const { id } = req.params;
    const success = db.deleteAttendanceRecord(id);
    res.json({ success });
  },

  getConfigs(_req, res) {
    const configs = db.getAttendanceSessionConfigs();
    res.json({ configs });
  },

  updateConfigs(req, res) {
    const { configs } = req.body;
    if (!Array.isArray(configs)) {
      res.status(400).json({ error: 'Session configurations array is required.' });
      return;
    }
    db.updateAttendanceSessionConfigs(configs);
    res.json({ success: true, configs: db.getAttendanceSessionConfigs() });
  }
};