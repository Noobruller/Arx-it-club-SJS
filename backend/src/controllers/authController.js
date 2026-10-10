
import { db } from '../services/db.js';
import { verifyPassword, validateStrongPassword } from '../utils/passwordUtils.js';
import { createToken } from '../utils/jwtUtils.js';
import {} from '../middleware/authMiddleware.js';
import { CONFIG } from '../config/index.js';
import { sendTelegramMessage } from './telegramController.js';
import { validatePersonName, validateTelegramUsername } from '../utils/validationUtils.js';
import { validateAndSaveAwardFile } from '../utils/awardFileUtils.js';
import { sanitizeText } from '../utils/sanitizeUtils.js';

const VALID_GRADES = [
'9A', '9B', '9C', '9D', '9E',
'10A', '10B', '10C', '10D', '10E',
'11A', '11B', '11C', '11D', '11E',
'12A', '12B', '12C', '12D', '12E'];


export function normalizeEthiopianPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: '', error: 'Please enter your phone number.' };
  }
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Strip duplicate prefixes like +251+251, +251251, 251251
  while (cleaned.startsWith('+251+251')) cleaned = cleaned.replace(/^\+251\+251/, '+251');
  while (cleaned.startsWith('+251251')) cleaned = cleaned.replace(/^\+251251/, '+251');
  while (cleaned.startsWith('251251')) cleaned = cleaned.replace(/^251251/, '251');

  let digitsAfterCountry = '';
  if (cleaned.startsWith('+251')) {
    digitsAfterCountry = cleaned.slice(4);
  } else if (cleaned.startsWith('251')) {
    digitsAfterCountry = cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    digitsAfterCountry = cleaned.slice(1);
  } else {
    digitsAfterCountry = cleaned;
  }

  // Remove leading 0 if entered after country code
  if (digitsAfterCountry.startsWith('0')) {
    digitsAfterCountry = digitsAfterCountry.slice(1);
  }

  if (!/^\d{9}$/.test(digitsAfterCountry)) {
    return {
      valid: false,
      normalized: '',
      error: 'Please enter a valid 9-digit Ethiopian phone number (+251 followed by 9 digits, e.g. +251 911 234 567 or 911234567).'
    };
  }

  return { valid: true, normalized: `+251${digitsAfterCountry}` };
}

export const authController = {
  register(req, res) {
    try {
      // Admin-controlled registration lifecycle check
      const currentSettings = db.getSettings();
      if (currentSettings.registrationStatus === 'CLOSED') {
        res.status(403).json({
          error:
          currentSettings.registrationClosedMessage ||
          'Registration for ARX IT CLUB OF SJS is currently closed. Please check back during the next term or join @arxitclub for updates.'
        });
        return;
      }

      const {
        firstName,
        secondName,
        lastName,
        studentName,
        class: studentClass,
        password,
        confirmPassword,
        phoneNumber,
        email,
        telegramUsername,
        courseId,
        selectedCourseId,
        award,
        awardFiles,
        motivationEssay,
        essay,
        paragraph
      } = req.body;

      // Validate uploaded award files (if any provided)
      const validatedAwardFilesToSave = [];
      if (awardFiles !== undefined && awardFiles !== null) {
        if (!Array.isArray(awardFiles)) {
          res.status(400).json({ error: 'Uploaded award files must be an array of files.' });
          return;
        }

        if (awardFiles.length > 5) {
          res.status(400).json({ error: 'You may upload a maximum of 5 supporting award files.' });
          return;
        }

        for (const fileInput of awardFiles) {
          const valRes = validateAndSaveAwardFile(fileInput);
          if (!valRes.success || !valRes.file) {
            res.status(400).json({ error: valRes.error || 'Invalid award file upload.' });
            return;
          }
          validatedAwardFilesToSave.push(valRes.file);
        }
      }

      // Support separate fields: First Name, Second Name, Last Name
      let cleanFirst = (typeof firstName === 'string' ? firstName : '').trim();
      let cleanSecond = (typeof secondName === 'string' ? secondName : '').trim();
      let cleanLast = (typeof lastName === 'string' ? lastName : '').trim();

      // Backward compatibility if single studentName provided
      if (!cleanFirst && !cleanLast && typeof studentName === 'string' && studentName.trim().length > 0) {
        const parts = studentName.trim().split(/\s+/);
        cleanFirst = parts[0] || '';
        if (parts.length > 2) {
          cleanSecond = parts.slice(1, -1).join(' ');
          cleanLast = parts[parts.length - 1] || '';
        } else if (parts.length === 2) {
          cleanLast = parts[1] || '';
        }
      }

      // Requirement 4 — NAME VALIDATION
      const firstCheck = validatePersonName(cleanFirst, 'First Name');
      if (!firstCheck.valid) {
        res.status(400).json({ error: firstCheck.error });
        return;
      }
      cleanFirst = firstCheck.normalized;

      if (cleanSecond) {
        const secondCheck = validatePersonName(cleanSecond, 'Second Name');
        if (!secondCheck.valid) {
          res.status(400).json({ error: secondCheck.error });
          return;
        }
        cleanSecond = secondCheck.normalized;
      }

      const lastCheck = validatePersonName(cleanLast, 'Last Name');
      if (!lastCheck.valid) {
        res.status(400).json({ error: lastCheck.error });
        return;
      }
      cleanLast = lastCheck.normalized;

      // Grade Validation (Requirement 11: 9A-9E, 10A-10E, 11A-11E, 12A-12E)
      const cleanGrade = (typeof studentClass === 'string' ? studentClass : '').trim().toUpperCase();
      if (!cleanGrade || !VALID_GRADES.includes(cleanGrade)) {
        res.status(400).json({
          error: 'Please select a valid Grade section (e.g. 9A-9E, 10A-10E, 11A-11E, or 12A-12E).'
        });
        return;
      }

      // Confirm Password Check (Requirement 1 & 4)
      if (confirmPassword === undefined || confirmPassword === null || typeof confirmPassword !== 'string') {
        res.status(400).json({ error: 'Please confirm your password.' });
        return;
      }

      if (confirmPassword !== password) {
        res.status(400).json({ error: 'Passwords do not match.' });
        return;
      }

      // Ethiopian Phone Number Validation (Requirement 10: +251XXXXXXXXX)
      const phoneValidation = normalizeEthiopianPhone(phoneNumber);
      if (!phoneValidation.valid) {
        res.status(400).json({ error: phoneValidation.error });
        return;
      }
      const normalizedPhone = phoneValidation.normalized;

      // Check for duplicate phone number
      const existingWithPhone = db.findMemberByPhone(normalizedPhone);
      if (existingWithPhone) {
        res.status(409).json({
          error: 'This phone number is already registered to another member account. Please log in with your Member ID.'
        });
        return;
      }

      // Optional Email Validation (Requirement 12)
      let cleanEmail = undefined;
      if (email && typeof email === 'string' && email.trim().length > 0) {
        const candidateEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(candidateEmail)) {
          res.status(400).json({ error: 'Please enter a valid email address or leave the email field blank.' });
          return;
        }
        const existingWithEmail = db.findMemberByEmail(candidateEmail);
        if (existingWithEmail) {
          res.status(409).json({
            error: 'This email address is already associated with an existing account. Please log in with your Member ID.'
          });
          return;
        }
        cleanEmail = candidateEmail;
      }

      // Requirement 3 — TELEGRAM USERNAME VALIDATION
      const tgValidation = validateTelegramUsername(
        telegramUsername,
        db.getExistingTelegramUsernames()
      );
      if (!tgValidation.valid) {
        const statusCode = tgValidation.error?.includes('already connected') ? 409 : 400;
        res.status(statusCode).json({ error: tgValidation.error });
        return;
      }
      const normalizedTelegram = tgValidation.normalized;

      // Strong Password Requirement Validation (Requirement 2 & 8)
      const personalInfoCandidates = [
      cleanFirst,
      cleanSecond,
      cleanLast,
      normalizedPhone.replace(/\D/g, ''),
      cleanEmail ? cleanEmail.split('@')[0] : '',
      normalizedTelegram.replace(/^@/, '')].
      filter(Boolean);

      const passwordValidation = validateStrongPassword(password, {
        confirmPassword,
        personalInfo: personalInfoCandidates
      });

      if (!passwordValidation.valid) {
        res.status(400).json({
          error: passwordValidation.errors[0] || 'Password does not meet security requirements.',
          errors: passwordValidation.errors
        });
        return;
      }

      // Dynamic Course Selection (Requirement 14 & Priority B)
      const targetCourseId = (typeof courseId === 'string' ? courseId : typeof selectedCourseId === 'string' ? selectedCourseId : '').trim();
      if (!targetCourseId) {
        res.status(400).json({ error: 'Please choose an available course track to complete your registration.' });
        return;
      }

      const selectedCourse = db.getCourseById(targetCourseId);
      if (!selectedCourse) {
        res.status(400).json({ error: 'The selected course track was not found. Please select an available course.' });
        return;
      }

      if (
      selectedCourse.isPublished === false ||
      selectedCourse.status !== 'Available' ||
      selectedCourse.isAvailableForRegistration === false)
      {
        res.status(400).json({
          error: `The course "${selectedCourse.title}" is currently not accepting new student admissions. Please select another available course.`
        });
        return;
      }

      // Check for duplicate account based on First Name, Second Name, Last Name, Classroom, Phone, and Telegram
      const existingDuplicate = db.findDuplicateRegistration({
        firstName: cleanFirst,
        secondName: cleanSecond,
        lastName: cleanLast,
        class: cleanGrade,
        phoneNumber: normalizedPhone,
        telegramUsername: normalizedTelegram
      });

      if (existingDuplicate) {
        res.status(409).json({
          error:
          'An account with these details (Name, Grade, Phone Number, and Telegram) is already registered. Please log in with your Member ID.'
        });
        return;
      }

      const rawEssay = motivationEssay || essay || paragraph;
      const cleanEssay = rawEssay && typeof rawEssay === 'string' && rawEssay.trim().length > 0 ? sanitizeText(rawEssay.trim()) : undefined;

      const newMember = db.createMember({
        firstName: cleanFirst,
        secondName: cleanSecond || undefined,
        lastName: cleanLast,
        class: cleanGrade,
        password,
        phoneNumber: normalizedPhone,
        email: cleanEmail,
        telegramUsername: normalizedTelegram,
        award: award ? sanitizeText(String(award).trim()) : undefined,
        motivationEssay: cleanEssay,
        essay: cleanEssay
      });

      // Save and attach any uploaded award files
      const savedAwardFiles = [];
      for (const f of validatedAwardFilesToSave) {
        const saved = db.addMemberAwardFile({
          memberId: newMember.id,
          originalFilename: f.originalFilename,
          filename: f.filename,
          storagePath: f.storagePath,
          url: f.url,
          fileSize: f.fileSize,
          formattedSize: f.formattedSize,
          mimeType: f.mimeType
        });
        savedAwardFiles.push(saved);
      }

      // Automatically enroll member in chosen course (Member -> Enrollment -> Course)
      const initialEnrollment = db.enrollMemberInCourse(newMember.id, selectedCourse.id);

      // Create activation session (CRITICAL: DOES NOT GENERATE ACTIVATION CODE YET)
      const activationSession = db.createActivationSession(
        newMember.id,
        newMember.memberId,
        newMember.studentName,
        newMember.telegramUsername
      );

      const safeMember = {
        id: newMember.id,
        memberId: newMember.memberId,
        studentName: newMember.studentName,
        firstName: newMember.firstName,
        secondName: newMember.secondName,
        lastName: newMember.lastName,
        class: newMember.class,
        phoneNumber: newMember.phoneNumber,
        email: newMember.email,
        telegramUsername: newMember.telegramUsername,
        telegramUserId: newMember.telegramUserId,
        telegramActivated: false, // PENDING_VERIFICATION (Requirement 6)
        telegramLinkedAt: newMember.telegramLinkedAt,
        award: newMember.award,
        awardFiles: savedAwardFiles,
        role: newMember.role,
        status: newMember.status,
        isApproved: Boolean(newMember.isApproved),
        createdAt: newMember.createdAt
      };

      const settings = db.getSettings();
      const botUrl = settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot';
      const activationUrl = `${botUrl}?start=${activationSession.token}`;

      // Requirement 6: The account is created as pending manual admin review.
      // Active student access is not granted until approved by an administrator.
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully! Your application is currently under review by an administrator.',
        memberId: newMember.memberId,
        member: safeMember,
        course: {
          id: selectedCourse.id,
          title: selectedCourse.title,
          category: selectedCourse.category,
          duration: selectedCourse.duration
        },
        enrollment: initialEnrollment,
        activation: {
          token: activationSession.token,
          activationUrl,
          botUsername: settings.telegramBotUsername || 'ARXITCLUB_bot',
          botUrl: settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
          channelName: settings.telegramChannelName || CONFIG.TELEGRAM_CHANNEL_HANDLE || '@arxitclub',
          channelUrl: settings.telegramChannelUrl || CONFIG.TELEGRAM_CHANNEL_LINK || 'https://t.me/arxitclub',
          expiresAt: activationSession.expiresAt
        },
        activationUrl,
        activationToken: activationSession.token,
        telegramBotUsername: settings.telegramBotUsername || 'ARXITCLUB_bot',
        telegramBotUrl: settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
        telegramChannelUrl: settings.telegramChannelUrl || CONFIG.TELEGRAM_CHANNEL_LINK || 'https://t.me/arxitclub',
        telegramChannelName: settings.telegramChannelName || CONFIG.TELEGRAM_CHANNEL_HANDLE || '@arxitclub'
      });
    } catch {
      res.status(500).json({ error: 'Something went wrong while creating your account. Please try again.' });
    }
  },

  login(req, res) {
    try {
      const { memberId, password } = req.body;

      if (!memberId || typeof memberId !== 'string' || !password || typeof password !== 'string') {
        res.status(400).json({ error: 'Member ID and password are required.' });
        return;
      }

      const cleanMemberId = memberId.trim().toUpperCase();
      const member = db.findMemberByMemberId(cleanMemberId);

      if (!member) {
        res.status(401).json({ error: 'Invalid Member ID or password. Please verify your credentials.' });
        return;
      }

      if (member.role === 'member') {
        if (member.status === 'pending') {
          res.status(403).json({
            error: 'Your application is currently under review by an administrator.',
            status: 'pending'
          });
          return;
        }

        if (member.status === 'rejected') {
          res.status(403).json({
            error: member.rejectionReason
              ? `Your application was not approved: ${member.rejectionReason}`
              : 'Your application has been declined by an administrator.',
            status: 'rejected'
          });
          return;
        }

        if (member.status === 'suspended') {
          res.status(403).json({
            error: 'Your account is currently suspended. Please contact club administration.',
            status: 'suspended'
          });
          return;
        }

        if (member.status !== 'approved' && member.status !== 'active') {
          res.status(403).json({
            error: 'Your application is currently under review by an administrator.',
            status: member.status
          });
          return;
        }
      } else if (member.status === 'suspended') {
        res.status(403).json({ error: 'Your account is currently suspended. Please contact club administration.' });
        return;
      }

      const isPasswordValid = verifyPassword(password, member.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid Member ID or password. Please verify your credentials.' });
        return;
      }

      const token = createToken({
        id: member.id,
        memberId: member.memberId,
        studentName: member.studentName,
        role: member.role
      });

      const safeMember = {
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
        role: member.role,
        status: member.status,
        isApproved: Boolean(member.isApproved),
        createdAt: member.createdAt
      };

      // SEC: Set HTTP-only, Secure, SameSite cookie for the session token in addition to
      // returning it in the JSON body (Bearer token for the existing client flow).
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('arx_session', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        path: '/'
      });

      res.json({
        success: true,
        message: 'Welcome back!',
        member: safeMember,
        token
      });
    } catch {
      res.status(500).json({ error: 'An unexpected error occurred during login. Please try again later.' });
    }
  },

  adminLogin(req, res) {
    try {
      const { memberId, password } = req.body;

      if (!memberId || typeof memberId !== 'string' || !password || typeof password !== 'string') {
        res.status(400).json({ error: 'Administrator ID/Username and password are required.' });
        return;
      }

      const cleanId = memberId.trim().toUpperCase();
      let member = db.findMemberByMemberId(cleanId);
      if (!member && (cleanId === 'ADMIN' || cleanId === 'ADMINISTRATOR' || cleanId === 'ADMIN_ROOT' || cleanId === 'ARX-ADMIN' || cleanId === 'ITCLUB_ADMIN' || cleanId === '@ITCLUB_ADMIN' || cleanId.startsWith('ADMIN') || cleanId.includes('ADMIN'))) {
        member = db.findMemberById('admin_root') || db.findMemberByMemberId('ARX-admin');
      }

      if (!member || member.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Administrator credentials required (Username: admin or ARX-admin).' });
        return;
      }

      const isPasswordValid = verifyPassword(password, member.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid administrator credentials.' });
        return;
      }

      const token = createToken({
        id: member.id,
        memberId: member.memberId,
        studentName: member.studentName,
        role: 'admin'
      });

      // SEC: Set HTTP-only, Secure, SameSite cookie for admin session.
      const isProductionAdmin = process.env.NODE_ENV === 'production';
      res.cookie('arx_session', token, {
        httpOnly: true,
        secure: isProductionAdmin,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.json({
        success: true,
        message: 'Administrator authentication successful.',
        member: {
          id: member.id,
          memberId: member.memberId,
          studentName: member.studentName,
          role: 'admin',
          class: member.class
        },
        token
      });
    } catch {
      res.status(500).json({ error: 'Administrator authentication failed. Please try again.' });
    }
  },

  logout(_req, res) {
    // Clear the session cookie on logout
    res.clearCookie('arx_session', { path: '/', httpOnly: true, sameSite: 'strict' });
    res.json({ success: true, message: 'Logged out successfully.' });
  },

  activateAccount(req, res) {
    try {
      const { code, memberId } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Activation code is required. Please check the code and try again.' });
        return;
      }

      const cleanCode = code.trim();
      const cleanMemberId = typeof memberId === 'string' && memberId.trim() ? memberId.trim() : undefined;
      const result = db.activateAccountByCode(cleanCode, cleanMemberId);

      if (!result.success) {
        if (result.alreadyActive) {
          res.status(200).json({
            success: false,
            alreadyActive: true,
            code: 'ALREADY_ACTIVATED',
            message: result.message || 'This account is already activated.',
            member: result.member ? {
              memberId: result.member.memberId,
              studentName: result.member.studentName,
              class: result.member.class,
              telegramActivated: true
            } : undefined
          });
          return;
        }

        if (result.code === 'EXPIRED_CODE') {
          res.status(400).json({ error: result.message || 'This activation code has expired.' });
          return;
        }

        if (result.code === 'REVOKED_CODE') {
          res.status(400).json({ error: result.message || 'This activation code has been revoked.' });
          return;
        }

        if (result.code === 'MEMBER_MISMATCH') {
          res.status(400).json({ error: result.message || 'This activation code belongs to another member registration.' });
          return;
        }

        if (result.code === 'CHANNEL_NOT_VERIFIED') {
          res.status(400).json({ error: result.message || 'Channel membership has not been verified.' });
          return;
        }

        if (result.code === 'TELEGRAM_ALREADY_LINKED') {
          res.status(400).json({ error: result.message || 'Telegram account is already linked to another member.' });
          return;
        }

        res.status(400).json({ error: result.message || 'Invalid activation code. Please check the code and try again.' });
        return;
      }

      const settings = db.getSettings();
      res.status(200).json({
        success: true,
        message: 'Account activated successfully.',
        member: result.member ? {
          id: result.member.id,
          memberId: result.member.memberId,
          studentName: result.member.studentName,
          class: result.member.class,
          role: result.member.role,
          telegramUsername: result.member.telegramUsername,
          telegramActivated: true
        } : undefined,
        telegramBotUrl: settings.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
        telegramChannelUrl: settings.telegramChannelUrl || CONFIG.TELEGRAM_CHANNEL_LINK || 'https://t.me/arxitclub'
      });
    } catch {
      res.status(500).json({ error: 'Something went wrong while activating your account. Please try again later.' });
    }
  },

  me(req, res) {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const member = db.findMemberById(req.user.id);
    if (!member) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    const safeMember = {
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
      role: member.role,
      status: member.status,
      isApproved: Boolean(member.isApproved),
      createdAt: member.createdAt
    };

    res.json({ member: safeMember });
  },

  // --- Forgot Password via Telegram (Requirement 8) ---
  async forgotPasswordRequest(req, res) {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({ error: 'Please enter your Member ID, email, or phone number.' });
      return;
    }

    const result = db.createPasswordResetSession(identifier.trim());
    if (!result.success || !result.session || !result.member) {
      res.status(400).json({ error: result.message });
      return;
    }

    const session = result.session;
    const member = result.member;

    // Send code to linked Telegram account
    if (member.telegramUserId) {
      const resetMsg =
      `🔐 *ARX IT CLUB OF SJS — Password Reset Request*\n\n` +
      `A password reset request was initiated for student *${member.studentName}* (\`${member.memberId}\`).\n\n` +
      `Your 6-digit reset code is:\n\`${session.code}\`\n\n` +
      `⏰ This code expires in 15 minutes and can only be used once.\n` +
      `If you did not make this request, please disregard this message or alert an administrator.`;

      await sendTelegramMessage(member.telegramUserId, resetMsg).catch(() => {});
    }

    res.json({
      success: true,
      message: 'A 6-digit password reset code has been sent through the official ARX Telegram bot to your linked Telegram account.',
      memberId: member.memberId,
      telegramLinked: Boolean(member.telegramUserId || member.telegramUsername)
    });
  },

  async forgotPasswordVerifyCode(req, res) {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      res.status(400).json({ error: 'Member identifier and 6-digit reset code are required.' });
      return;
    }

    const result = db.verifyPasswordResetCode(String(identifier).trim(), String(code).trim());
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      resetToken: result.resetToken,
      message: 'Reset code verified successfully. Please set your new password.'
    });
  },

  async forgotPasswordReset(req, res) {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({ error: 'Reset token and new password are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const strengthCheck = validateStrongPassword(newPassword);
    if (!strengthCheck.valid) {
      res.status(400).json({ error: strengthCheck.errors.join(' ') || 'Password does not meet complexity requirements.' });
      return;
    }

    const result = db.completePasswordReset(String(resetToken).trim(), newPassword);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log into the Member Portal.'
    });
  }
};