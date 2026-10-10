
import { db } from '../services/db.js';
import {} from '../middleware/authMiddleware.js';
import fs from 'fs';
import path from 'path';

// Allowed course assignment submission file extensions
const ALLOWED_EXTENSIONS = new Set([
'pdf', 'doc', 'docx', 'txt', 'html', 'zip', 'tar', 'gz',
'py', 'js', 'ts', 'jsx', 'tsx', 'css', 'json', 'md',
'png', 'jpg', 'jpeg', 'webp', 'svg']
);

// Explicitly blocked dangerous executable extensions
const BLOCKED_EXTENSIONS = new Set([
'exe', 'bat', 'cmd', 'sh', 'com', 'vbs', 'msi', 'dll', 'scr', 'bin', 'jar', 'pif']
);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function sanitizeFileName(rawName) {
  return rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const assignmentController = {
  // Member: Get all published assignments for courses the member is enrolled in
  getMemberAssignments(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const memberId = req.user.id;
    const enrollments = db.getMemberEnrollments(memberId);
    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

    // Get published assignments for member's courses
    const allAssignments = db.getAssignments(undefined, true);
    const memberAssignments = allAssignments.filter(
      (a) => a.courseId === 'general' || enrolledCourseIds.has(a.courseId)
    );

    // Attach member's submission status if exists
    const memberSubmissions = db.getMemberSubmissions(req.user.memberId);
    const subMap = new Map(memberSubmissions.map((s) => [s.assignmentId, s]));

    const result = memberAssignments.map((a) => {
      const mySub = subMap.get(a.id);
      return {
        ...a,
        submission: mySub || null,
        hasSubmitted: Boolean(mySub)
      };
    });

    res.json({ assignments: result });
  },

  // Member or Admin: Get single assignment
  getAssignmentById(req, res) {
    const { id } = req.params;
    const assignment = db.getAssignmentById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found.' });
      return;
    }

    let mySubmission = null;
    if (req.user) {
      const subs = db.getMemberSubmissions(req.user.memberId);
      mySubmission = subs.find((s) => s.assignmentId === assignment.id) || null;
    }

    res.json({ assignment, submission: mySubmission });
  },

  // Member: Submit course assignment file
  submitAssignment(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const assignment = db.getAssignmentById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found.' });
      return;
    }

    const { dataUrl, filename, comment } = req.body;
    if (!dataUrl || !filename) {
      res.status(400).json({ error: 'A file submission is required.' });
      return;
    }

    // Sanitize and validate file extension
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    if (BLOCKED_EXTENSIONS.has(ext)) {
      res.status(400).json({ error: 'Executable files (.exe, .sh, .bat, etc.) are strictly prohibited.' });
      return;
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      res.status(400).json({
        error: `File type .${ext} is not allowed. Supported formats include: PDF, DOCX, TXT, HTML, ZIP, Python, and Images.`
      });
      return;
    }

    // Validate Base64 data
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid file payload.' });
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: 'File size exceeds maximum limit of 15MB.' });
      return;
    }

    // Save file into uploads/submissions directory
    const uploadsSubmissionsDir = path.resolve(process.cwd(), 'uploads', 'submissions');
    if (!fs.existsSync(uploadsSubmissionsDir)) {
      fs.mkdirSync(uploadsSubmissionsDir, { recursive: true });
    }

    const safeName = sanitizeFileName(filename);
    const storageFileName = `sub_${req.user.memberId}_${Date.now()}_${safeName}`;
    const filePath = path.join(uploadsSubmissionsDir, storageFileName);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch {
      res.status(500).json({ error: 'Failed to write submission file to disk.' });
      return;
    }

    const fileUrl = `/uploads/submissions/${storageFileName}`;

    const submissionResult = db.submitAssignment({
      assignmentId: assignment.id,
      memberId: req.user.memberId,
      studentName: req.user.studentName,
      fileUrl,
      fileName: safeName,
      fileSize: buffer.length,
      fileType: mimeType || ext,
      studentComment: comment ? String(comment).trim() : undefined
    });

    res.status(201).json(submissionResult);
  },

  // Member: Get personal submission history
  getMySubmissions(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const submissions = db.getMemberSubmissions(req.user.memberId);
    res.json({ submissions });
  },

  // Member or Admin: Secure download of submission file with ownership validation
  downloadSubmission(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { subId } = req.params;
    // Find submission across all submissions
    const allAssignments = db.getAssignments(undefined, false);
    let targetSub = null;
    for (const asg of allAssignments) {
      const subs = db.getAssignmentSubmissions(asg.id);
      const found = subs.find((s) => s.id === subId);
      if (found) {
        targetSub = found;
        break;
      }
    }

    if (!targetSub) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    // Authorization: member can only download their own submission, unless admin
    if (req.user.role !== 'admin' && targetSub.memberId !== req.user.memberId) {
      res.status(403).json({ error: 'Unauthorized: You cannot access submissions belonging to another member.' });
      return;
    }

    const fileNameOnDisk = path.basename(targetSub.fileUrl);
    const diskPath = path.resolve(process.cwd(), 'uploads', 'submissions', fileNameOnDisk);

    if (!fs.existsSync(diskPath)) {
      res.status(404).json({ error: 'File not found on server.' });
      return;
    }

    res.download(diskPath, targetSub.fileName);
  },

  // --- Admin Endpoints ---
  getAllAdmin(req, res) {
    const assignments = db.getAssignments(undefined, false);
    res.json({ assignments });
  },

  createAssignment(req, res) {
    const newAsg = db.createAssignment(req.body);
    res.status(201).json({ success: true, assignment: newAsg });
  },

  updateAssignment(req, res) {
    const { id } = req.params;
    const updated = db.updateAssignment(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Assignment not found.' });
      return;
    }
    res.json({ success: true, assignment: updated });
  },

  deleteAssignment(req, res) {
    const { id } = req.params;
    const success = db.deleteAssignment(id);
    res.json({ success });
  },

  getAssignmentSubmissions(req, res) {
    const { id } = req.params;
    const submissions = db.getAssignmentSubmissions(id);
    res.json({ submissions });
  },

  gradeSubmission(req, res) {
    const { subId } = req.params;
    const { score, feedback, status } = req.body;
    const graded = db.gradeSubmission(
      subId,
      Number(score),
      String(feedback || ''),
      status,
      req.user?.studentName || 'Administrator'
    );
    if (!graded) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }
    res.json({ success: true, submission: graded });
  }
};