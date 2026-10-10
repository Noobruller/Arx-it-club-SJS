
import fs from 'fs';
import path from 'path';
import {} from '../middleware/authMiddleware.js';
import { db } from '../services/db.js';
import { sanitizeText, sanitizeUrl } from '../utils/sanitizeUtils.js';
import {
  configureTelegramBotToken,
  testFullTelegramConnection,
  syncTelegramBotCommands } from './telegramController.js';

export const adminController = {
  // --- Overview Stats ---
  getOverview(_req, res) {
    const stats = db.getAdminOverviewStats();
    res.json({ stats });
  },

  // --- Student Applications Review System ---
  getApplications(req, res) {
    try {
      const { status } = req.query;
      // Default to 'pending' as specified in Requirement 3
      const filterStatus = status || 'pending';
      const applications = db.getApplications(filterStatus);

      const safeList = applications.map((m) => {
        const rawFiles = db.getMemberAwardFiles(m.id);
        const awardFiles = rawFiles.map(f => ({
          ...f,
          dataUrl: f.base64 ? `data:${f.mimeType || 'image/jpeg'};base64,${f.base64}` : (f.dataUrl || undefined)
        }));
        const enrollments = db.getMemberEnrollments(m.id);
        const enrolledCourse = enrollments.length > 0 ? db.getCourseById(enrollments[0].courseId) : null;

        return {
          id: m.id,
          memberId: m.memberId,
          studentName: m.studentName,
          firstName: m.firstName,
          secondName: m.secondName,
          lastName: m.lastName,
          class: m.class,
          phoneNumber: m.phoneNumber,
          email: m.email,
          telegramUsername: m.telegramUsername,
          telegramUserId: m.telegramUserId,
          telegramActivated: Boolean(m.telegramActivated),
          award: m.award,
          motivationEssay: m.motivationEssay || m.essay || undefined,
          essay: m.essay || m.motivationEssay || undefined,
          awardFiles,
          awardFilesCount: awardFiles.length,
          hasAwardFiles: awardFiles.length > 0,
          course: enrolledCourse ? {
            id: enrolledCourse.id,
            title: enrolledCourse.title,
            category: enrolledCourse.category
          } : null,
          role: m.role,
          status: m.status,
          isApproved: Boolean(m.isApproved),
          rejectionReason: m.rejectionReason,
          approvedAt: m.approvedAt,
          rejectedAt: m.rejectedAt,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt
        };
      });

      res.json({
        success: true,
        applications: safeList,
        count: safeList.length
      });
    } catch {
      res.status(500).json({ error: 'Failed to fetch student applications.' });
    }
  },

  approveApplication(req, res) {
    try {
      const { id } = req.params;
      const approved = db.approveApplication(id);
      if (!approved) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }

      res.json({
        success: true,
        message: `Application for ${approved.studentName} (${approved.memberId}) has been approved. Student access is activated.`,
        application: {
          id: approved.id,
          memberId: approved.memberId,
          studentName: approved.studentName,
          status: approved.status,
          isApproved: approved.isApproved,
          approvedAt: approved.approvedAt
        }
      });
    } catch {
      res.status(500).json({ error: 'Failed to approve student application.' });
    }
  },

  rejectApplication(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason, reason } = req.body || {};
      const rejected = db.rejectApplication(id, rejectionReason || reason);
      if (!rejected) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }

      res.json({
        success: true,
        message: `Application for ${rejected.studentName} (${rejected.memberId}) has been rejected.`,
        application: {
          id: rejected.id,
          memberId: rejected.memberId,
          studentName: rejected.studentName,
          status: rejected.status,
          isApproved: rejected.isApproved,
          rejectionReason: rejected.rejectionReason,
          rejectedAt: rejected.rejectedAt
        }
      });
    } catch {
      res.status(500).json({ error: 'Failed to reject student application.' });
    }
  },

  // --- Members Management ---
  getMembers(req, res) {
    const { q, status } = req.query;
    let members = db.getAdminMembers();

    // Do not return internal passwordHash
    let safeList = members.map((m) => {
      const awardFiles = db.getMemberAwardFiles(m.id);
      return {
        id: m.id,
        memberId: m.memberId,
        studentName: m.studentName,
        class: m.class,
        phoneNumber: m.phoneNumber,
        telegramUsername: m.telegramUsername,
        telegramUserId: m.telegramUserId,
        telegramActivated: Boolean(m.telegramActivated),
        telegramLinkedAt: m.telegramLinkedAt,
        award: m.award,
        motivationEssay: m.motivationEssay || m.essay || undefined,
        essay: m.essay || m.motivationEssay || undefined,
        awardFiles,
        awardFilesCount: awardFiles.length,
        hasAwardFiles: awardFiles.length > 0,
        role: m.role,
        status: m.status,
        isApproved: Boolean(m.isApproved),
        rejectionReason: m.rejectionReason,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      };
    });

    if (q && typeof q === 'string') {
      const search = q.toLowerCase();
      safeList = safeList.filter(
        (m) =>
        m.studentName.toLowerCase().includes(search) ||
        m.memberId.toLowerCase().includes(search) ||
        m.class.toLowerCase().includes(search)
      );
    }

    if (status && typeof status === 'string' && status !== 'all') {
      safeList = safeList.filter((m) => m.status === status);
    }

    res.json({ members: safeList });
  },

  getMemberDetail(req, res) {
    const { id } = req.params;
    const member = db.findMemberById(id) || db.findMemberByMemberId(id);
    if (!member) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    const enrollments = db.getMemberEnrollments(member.id);
    const certificates = db.getMemberCertificates(member.id);
    const awards = db.getMemberAwards(member.id);
    const projects = db.getMemberProjects(member.studentName);
    const awardFiles = db.getMemberAwardFiles(member.id);

    res.json({
      member: {
        id: member.id,
        memberId: member.memberId,
        studentName: member.studentName,
        class: member.class,
        phoneNumber: member.phoneNumber,
        telegramUsername: member.telegramUsername,
        telegramUserId: member.telegramUserId,
        telegramActivated: Boolean(member.telegramActivated),
        telegramLinkedAt: member.telegramLinkedAt,
        award: member.award,
        motivationEssay: member.motivationEssay || member.essay || undefined,
        essay: member.essay || member.motivationEssay || undefined,
        awardFiles,
        role: member.role,
        status: member.status,
        isApproved: Boolean(member.isApproved),
        rejectionReason: member.rejectionReason,
        createdAt: member.createdAt
      },
      enrollments,
      certificates,
      awards,
      projects,
      awardFiles
    });
  },

  getMemberAwardFiles(req, res) {
    const { id } = req.params;
    const member = db.findMemberById(id) || db.findMemberByMemberId(id);
    if (!member) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }
    const files = db.getMemberAwardFiles(member.id);
    res.json({ awardFiles: files });
  },

  downloadAwardFile(req, res) {
    const { id } = req.params;
    const item = db.getMemberAwardFileById(id);
    if (!item) {
      res.status(404).json({ error: 'Award file record not found.' });
      return;
    }

    res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.originalFilename || 'award_document')}"`);

    // 1. Serve directly from in-memory / persistent base64 if available (serverless safe)
    if (item.base64) {
      const buffer = Buffer.from(item.base64, 'base64');
      return res.send(buffer);
    }
    if (item.dataUrl && item.dataUrl.includes('base64,')) {
      const b64 = item.dataUrl.split('base64,')[1];
      const buffer = Buffer.from(b64, 'base64');
      return res.send(buffer);
    }

    // 2. Fall back to disk storage if file exists on disk
    if (item.storagePath && fs.existsSync(item.storagePath)) {
      return res.sendFile(item.storagePath);
    }

    res.status(404).json({ error: 'Award file content not found.' });
  },

  updateMember(req, res) {
    const { id } = req.params;
    const { studentName, class: studentClass, phoneNumber, telegramUsername, award } = req.body;

    const updated = db.updateMemberProfile(id, {
      studentName,
      class: studentClass,
      phoneNumber,
      telegramUsername,
      award
    });

    if (!updated) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    res.json({ success: true, message: 'Member profile updated successfully.', member: updated });
  },

  toggleMemberStatus(req, res) {
    const { id } = req.params;
    const member = db.toggleMemberStatus(id);
    if (!member) {
      res.status(404).json({ error: 'Member not found or protected.' });
      return;
    }
    res.json({ success: true, message: `Account status updated to ${member.status}.`, member });
  },

  deleteMember(req, res) {
    const { id } = req.params;
    const deleted = db.deleteMember(id);
    if (!deleted) {
      res.status(400).json({ error: 'Could not delete member account or admin account cannot be deleted.' });
      return;
    }
    res.json({ success: true, message: 'Member account deleted successfully.' });
  },

  resetMemberPassword(req, res) {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }
    const success = db.updateMemberPassword(id, newPassword);
    if (!success) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }
    res.json({ success: true, message: 'Member password has been reset successfully.' });
  },

  // --- Courses Management ---
  getCourses(_req, res) {
    const courses = db.getCourses(false); // get all including unpublished
    res.json({ courses });
  },

  createCourse(req, res) {
    const {
      title,
      description,
      longDescription,
      difficulty,
      duration,
      instructor,
      status,
      category,
      topics,
      learningObjectives,
      requirements,
      certificateInfo,
      isPublished,
      thumbnailUrl,
      bannerUrl,
      thumbnailMediaId,
      bannerMediaId,
      isAvailableForRegistration
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Course title and description are required.' });
      return;
    }

    const course = db.createCourse({
      title: title.trim(),
      slug: '',
      description: description.trim(),
      longDescription: longDescription ? longDescription.trim() : description.trim(),
      difficulty: difficulty || 'Beginner',
      duration: duration || '4 weeks',
      instructor: instructor || 'IT Club Instructor',
      status: status || 'Available',
      category: category || 'Web Development',
      topics: Array.isArray(topics) ? topics : topics ? String(topics).split('\n').filter(Boolean) : ['Foundations'],
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : learningObjectives ? String(learningObjectives).split('\n').filter(Boolean) : ['Practical coding skills'],
      requirements: Array.isArray(requirements) ? requirements : requirements ? String(requirements).split('\n').filter(Boolean) : ['Basic computer literacy'],
      certificateInfo: certificateInfo || 'Certificate issued upon successful project review.',
      thumbnailUrl: thumbnailUrl || '',
      bannerUrl: bannerUrl || '',
      thumbnailMediaId: thumbnailMediaId || '',
      bannerMediaId: bannerMediaId || '',
      isPublished: isPublished !== undefined ? isPublished : true,
      isAvailableForRegistration: isAvailableForRegistration !== undefined ? Boolean(isAvailableForRegistration) : true
    });

    res.status(201).json({ success: true, message: 'Course created successfully.', course });
  },

  updateCourse(req, res) {
    const { id } = req.params;
    const updated = db.updateCourse(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    res.json({ success: true, message: 'Course updated successfully.', course: updated });
  },

  deleteCourse(req, res) {
    const { id } = req.params;
    const deleted = db.deleteCourse(id);
    if (!deleted) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    res.json({ success: true, message: 'Course deleted successfully.' });
  },

  // --- Enrollments Management ---
  getEnrollments(_req, res) {
    const enrollments = db.getAllEnrollments();
    res.json({ enrollments });
  },

  updateEnrollment(req, res) {
    const { id } = req.params;
    const { progress, status, certificateId } = req.body;
    const updated = db.updateEnrollment(id, { progress, status, certificateId });
    if (!updated) {
      res.status(404).json({ error: 'Enrollment record not found.' });
      return;
    }
    res.json({ success: true, message: 'Enrollment updated successfully.', enrollment: updated });
  },

  // --- Certificates Management ---
  getCertificates(_req, res) {
    const certificates = db.getAllCertificates();
    res.json({ certificates });
  },

  issueCertificate(req, res) {
    const { memberId, courseId, courseName, issueDate, authorizedSignatures } = req.body;

    if (!memberId || !courseName) {
      res.status(400).json({ error: 'Member and course name are required to issue a certificate.' });
      return;
    }

    const cert = db.issueCertificate({
      memberId,
      courseId,
      courseName,
      issueDate,
      authorizedSignatures
    });

    if (!cert) {
      res.status(404).json({ error: 'Could not find the target member to issue certificate.' });
      return;
    }

    res.status(201).json({ success: true, message: 'Certificate issued successfully.', certificate: cert });
  },

  toggleCertificate(req, res) {
    const { id } = req.params;
    const cert = db.toggleCertificateStatus(id);
    if (!cert) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }
    res.json({ success: true, message: `Certificate status changed to ${cert.status}.`, certificate: cert });
  },

  deleteCertificate(req, res) {
    const { id } = req.params;
    const deleted = db.deleteCertificate(id);
    if (!deleted) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }
    res.json({ success: true, message: 'Certificate record deleted.' });
  },

  // --- Awards Management ---
  getAwards(_req, res) {
    const awards = db.getAllAwards();
    res.json({ awards });
  },

  createAward(req, res) {
    const { memberId, title, description, date, category, badge } = req.body;

    if (!memberId || !title || !description) {
      res.status(400).json({ error: 'Member, award title, and description are required.' });
      return;
    }

    const award = db.createAward({
      memberId,
      title,
      description,
      date,
      category,
      badge
    });

    if (!award) {
      res.status(404).json({ error: 'Target member not found.' });
      return;
    }

    res.status(201).json({ success: true, message: 'Award assigned successfully.', award });
  },

  deleteAward(req, res) {
    const { id } = req.params;
    const deleted = db.deleteAward(id);
    if (!deleted) {
      res.status(404).json({ error: 'Award not found.' });
      return;
    }
    res.json({ success: true, message: 'Award deleted.' });
  },

  // --- Projects Management ---
  getProjects(_req, res) {
    const projects = db.getProjects(false);
    res.json({ projects });
  },

  createProject(req, res) {
    const { title, description, technologies, projectMembers, status, date, category, imageUrl, mediaId, galleryImages, githubUrl, liveDemoUrl, isPublished } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Project title and description are required.' });
      return;
    }

    const project = db.createProject({
      title: title.trim(),
      description: description.trim(),
      technologies: Array.isArray(technologies) ? technologies : technologies ? String(technologies).split(',').map((t) => t.trim()) : ['Tech'],
      projectMembers: Array.isArray(projectMembers) ? projectMembers : projectMembers ? String(projectMembers).split(',').map((m) => m.trim()) : ['IT Club Team'],
      status: status || 'In Progress',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      category: category || 'Web App',
      imageUrl: imageUrl || '',
      mediaId: mediaId || '',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : imageUrl ? [imageUrl] : [],
      githubUrl: githubUrl || '',
      liveDemoUrl: liveDemoUrl || '',
      isPublished: isPublished !== undefined ? isPublished : true
    });

    res.status(201).json({ success: true, message: 'Project created successfully.', project });
  },

  updateProject(req, res) {
    const { id } = req.params;
    const updated = db.updateProject(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ success: true, message: 'Project updated successfully.', project: updated });
  },

  deleteProject(req, res) {
    const { id } = req.params;
    const deleted = db.deleteProject(id);
    if (!deleted) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ success: true, message: 'Project deleted.' });
  },

  // --- Events Management ---
  getEvents(_req, res) {
    const events = db.getEvents(false);
    res.json({ events });
  },

  createEvent(req, res) {
    const { title, date, time, location, locationType, description, organizer, seatsAvailable, status, imageUrl, coverImageUrl, mediaId, galleryImages, isPublished } = req.body;

    if (!title || !date || !time) {
      res.status(400).json({ error: 'Event title, date, and time are required.' });
      return;
    }

    const dateObj = new Date(date);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const formattedDate = {
      day: String(dateObj.getDate() || '15'),
      month: months[dateObj.getMonth()] || 'OCT',
      year: String(dateObj.getFullYear() || '2026')
    };

    const finalCover = coverImageUrl || imageUrl || '';

    const event = db.createEvent({
      title: sanitizeText(title.trim()),
      date,
      formattedDate,
      time: sanitizeText(time.trim()),
      location: location ? sanitizeText(location) : 'Computer Lab 3',
      locationType: locationType || 'Onsite',
      description: description ? sanitizeText(description) : 'Workshop and hands-on technical session.',
      organizer: organizer ? sanitizeText(organizer) : 'IT Club Committee',
      seatsAvailable: seatsAvailable !== undefined ? parseInt(seatsAvailable, 10) : 30,
      status: status || 'Upcoming',
      imageUrl: finalCover,
      coverImageUrl: finalCover,
      mediaId: mediaId || '',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : finalCover ? [finalCover] : [],
      isPublished: isPublished !== undefined ? isPublished : true
    });

    res.status(201).json({ success: true, message: 'Event created successfully.', event });
  },

  updateEvent(req, res) {
    const { id } = req.params;
    const updated = db.updateEvent(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    res.json({ success: true, message: 'Event updated successfully.', event: updated });
  },

  deleteEvent(req, res) {
    const { id } = req.params;
    const deleted = db.deleteEvent(id);
    if (!deleted) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    res.json({ success: true, message: 'Event deleted.' });
  },

  // --- Achievements Management ---
  getAchievements(_req, res) {
    const achievements = db.getAchievements(false);
    res.json({ achievements });
  },

  createAchievement(req, res) {
    const { title, category, recipient, description, date, rank, imageUrl, mediaId, isPublished } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Achievement title and description are required.' });
      return;
    }

    const achievement = db.createAchievement({
      title: sanitizeText(title.trim()),
      category: category || 'club',
      recipient: recipient ? sanitizeText(recipient.trim()) : undefined,
      description: sanitizeText(description.trim()),
      date: date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rank: rank || 'Honor',
      imageUrl: imageUrl || '',
      mediaId: mediaId || '',
      isPublished: isPublished !== undefined ? isPublished : true
    });

    res.status(201).json({ success: true, message: 'Achievement published successfully.', achievement });
  },

  updateAchievement(req, res) {
    const { id } = req.params;
    const updated = db.updateAchievement(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Achievement not found.' });
      return;
    }
    res.json({ success: true, message: 'Achievement updated.', achievement: updated });
  },

  deleteAchievement(req, res) {
    const { id } = req.params;
    const deleted = db.deleteAchievement(id);
    if (!deleted) {
      res.status(404).json({ error: 'Achievement not found.' });
      return;
    }
    res.json({ success: true, message: 'Achievement deleted.' });
  },

  // --- Announcements Management ---
  getAnnouncements(_req, res) {
    const announcements = db.getAnnouncements(false);
    res.json({ announcements });
  },

  createAnnouncement(req, res) {
    const { title, content, priority, isPublished } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Announcement title and content are required.' });
      return;
    }

    const announcement = db.createAnnouncement({
      title: sanitizeText(title.trim()),
      content: sanitizeText(content.trim()),
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: priority || 'normal',
      isPublished: isPublished !== undefined ? isPublished : true
    });

    res.status(201).json({ success: true, message: 'Announcement created successfully.', announcement });
  },

  deleteAnnouncement(req, res) {
    const { id } = req.params;
    const deleted = db.deleteAnnouncement(id);
    if (!deleted) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }
    res.json({ success: true, message: 'Announcement deleted.' });
  },

  // --- Website Settings ---
  getSettings(_req, res) {
    const settings = db.getSettings();
    res.json({ settings });
  },

  updateSettings(req, res) {
    const payload = { ...req.body };
    if (payload.telegramBotUsername) {
      const cleanBot = payload.telegramBotUsername.replace(/^@/, '').trim();
      payload.telegramBotUsername = cleanBot;
      if (!payload.telegramBotUrl || payload.telegramBotUrl.includes('itclub_official') || payload.telegramBotUrl.includes('arx_')) {
        payload.telegramBotUrl = `https://t.me/${cleanBot}`;
      }
    }
    const updated = db.updateSettings(payload);
    res.json({ success: true, message: 'Website settings saved successfully.', settings: updated });
  },

  // --- Social Media Management ---
  getSocialLinks(_req, res) {
    const links = db.getSocialLinks();
    res.json({ socialLinks: links });
  },

  createSocialLink(req, res) {
    const { platform, name, url, icon, isEnabled, order } = req.body;
    if (!platform || !url) {
      res.status(400).json({ error: 'Platform and URL are required.' });
      return;
    }
    const link = db.createSocialLink({
      platform: platform.trim(),
      name: (name || platform).trim(),
      url: url.trim(),
      icon: icon ? icon.trim() : undefined,
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      order: typeof order === 'number' ? order : 10
    });
    res.status(201).json({ success: true, message: 'Social media link added.', socialLink: link });
  },

  updateSocialLink(req, res) {
    const { id } = req.params;
    const updated = db.updateSocialLink(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Social media link not found.' });
      return;
    }
    res.json({ success: true, message: 'Social media link updated.', socialLink: updated });
  },

  deleteSocialLink(req, res) {
    const { id } = req.params;
    const deleted = db.deleteSocialLink(id);
    if (!deleted) {
      res.status(404).json({ error: 'Social media link not found.' });
      return;
    }
    res.json({ success: true, message: 'Social media link deleted.' });
  },

  // --- Club Governance Management ---
  getGovernance(_req, res) {
    const list = db.getGovernanceRoles();
    res.json({ governance: list });
  },

  createGovernance(req, res) {
    const { name, role, department, term, description, photoUrl, mediaId, order } = req.body;
    if (!name || !role) {
      res.status(400).json({ error: 'Name and role title are required.' });
      return;
    }
    const created = db.createGovernanceRole({
      name: name.trim(),
      role: role.trim(),
      department: department ? department.trim() : undefined,
      term: term ? term.trim() : undefined,
      description: (description || '').trim(),
      photoUrl: photoUrl ? photoUrl.trim() : undefined,
      mediaId: mediaId ? mediaId.trim() : undefined,
      order: typeof order === 'number' ? order : 10
    });
    res.status(201).json({ success: true, message: 'Governance role added.', governanceRole: created });
  },

  updateGovernance(req, res) {
    const { id } = req.params;
    const updated = db.updateGovernanceRole(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Governance role not found.' });
      return;
    }
    res.json({ success: true, message: 'Governance role updated.', governanceRole: updated });
  },

  deleteGovernance(req, res) {
    const { id } = req.params;
    const deleted = db.deleteGovernanceRole(id);
    if (!deleted) {
      res.status(404).json({ error: 'Governance role not found.' });
      return;
    }
    res.json({ success: true, message: 'Governance role deleted.' });
  },

  reorderGovernance(req, res) {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      res.status(400).json({ error: 'Array of role IDs is required.' });
      return;
    }
    const reordered = db.reorderGovernanceRoles(ids);
    res.json({ success: true, message: 'Roles reordered.', governance: reordered });
  },

  // --- Admin Password Change ---
  changeAdminPassword(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    db.updateMemberPassword(req.user.id, newPassword);
    res.json({ success: true, message: 'Administrator password updated successfully.' });
  },

  // --- Registration Lifecycle Toggle ---
  toggleRegistrationStatus(req, res) {
    const { status, closedMessage } = req.body || {};
    const current = db.getSettings();
    const newStatus = status ?
    status === 'CLOSED' ? 'CLOSED' : 'OPEN' :
    current.registrationStatus === 'CLOSED' ? 'OPEN' : 'CLOSED';
    const updated = db.setRegistrationStatus(newStatus, closedMessage);
    res.json({
      success: true,
      message: `Club registration lifecycle is now ${newStatus}.`,
      registrationStatus: newStatus,
      settings: updated
    });
  },

  // --- Telegram Bot Operations ---
  getTelegramBotStatus(_req, res) {
    const status = db.getTelegramBotStatus();
    res.json({ status });
  },

  async updateTelegramBotToken(req, res) {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: 'Telegram bot token string is required.' });
      return;
    }
    const result = await configureTelegramBotToken(token);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  },

  async testTelegramBotConnection(_req, res) {
    const result = await testFullTelegramConnection();
    res.json(result);
  },

  getBotCommands(_req, res) {
    const commands = db.getBotCommands();
    res.json({ commands });
  },

  updateBotCommand(req, res) {
    const { command, updates } = req.body || {};
    if (!command || typeof command !== 'string') {
      res.status(400).json({ error: 'Command string is required.' });
      return;
    }
    const updated = db.updateBotCommand(command, updates || {});
    if (!updated) {
      res.status(404).json({ error: 'Bot command not found.' });
      return;
    }
    res.json({ success: true, message: `Command ${command} updated successfully.`, command: updated });
  },

  async syncBotCommands(_req, res) {
    const result = await syncTelegramBotCommands();
    res.json(result);
  },

  getBotContent(_req, res) {
    const content = db.getBotContent();
    res.json({ content });
  },

  updateBotContent(req, res) {
    const content = db.updateBotContent(req.body || {});
    res.json({ success: true, message: 'Bot content templates updated successfully.', content });
  }
};