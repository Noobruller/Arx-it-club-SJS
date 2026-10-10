import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';

import {
  CheckCircle2,
  Send,
  Copy,
  ArrowRight,
  ShieldCheck,
  Lock,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  Award,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  UploadCloud,
  FileText,
  X } from
'lucide-react';
import confetti from 'canvas-confetti';





const DEFAULT_FALLBACK_COURSES = [
  { id: 'crs_web_dev', title: 'Web Design & Development', category: 'Web Development', duration: '12 Weeks' },
  { id: 'crs_python', title: 'Python Programming', category: 'Programming', duration: '10 Weeks' },
  { id: 'crs_cybersecurity', title: 'Cybersecurity Defense', category: 'Security', duration: '12 Weeks' },
  { id: 'crs_robotics', title: 'Robotics Engineering', category: 'Hardware & Engineering', duration: '14 Weeks' },
  { id: 'crs_ai&machinelearning', title: 'AI & Machine Learning', category: 'Artificial Intelligence', duration: '12 Weeks' }
];

const GRADE_SECTIONS = [
{ grade: 'Grade 9', sections: ['9A', '9B', '9C', '9D', '9E'] },
{ grade: 'Grade 10', sections: ['10A', '10B', '10C', '10D', '10E'] },
{ grade: 'Grade 11', sections: ['11A', '11B', '11C', '11D', '11E'] },
{ grade: 'Grade 12', sections: ['12A', '12B', '12C', '12D', '12E'] }];

export const RegisterPage = ({ navigate }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    lastName: '',
    class: '',
    courseId: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    email: '',
    telegramUsername: '',
    award: '',
    motivationEssay: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [channelUrl, setChannelUrl] = useState('https://t.me/arxitclub');
  const [errorMessage, setErrorMessage] = useState(null);

  // Award file upload state
  const [awardFilesList, setAwardFilesList] = useState(





    []);
  const [awardFileUploadError, setAwardFileUploadError] = useState(null);

  // Activation code state (post-registration screen)
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [activatingAccount, setActivatingAccount] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [activatedSuccessData, setActivatedSuccessData] = useState(


    null);

  const compressAndProcessFile = async (file) => {
    const isImage = file.type.startsWith('image/');

    // For PDFs: enforce 2.5MB per-file limit so base64 fits safely within serverless limits
    if (!isImage) {
      if (file.size > 2.5 * 1024 * 1024) {
        throw new Error(`PDF "${file.name}" exceeds 2.5MB limit. Please upload a compressed PDF or document photo.`);
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            file,
            dataUrl: reader.result,
            filename: file.name,
            formattedSize: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
            mimeType: file.type,
            byteSize: file.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // For Images: client-side compress & downscale using HTML5 Canvas to prevent HTTP 413
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG at 0.78 quality (crisp document text, lightweight footprint)
          const outputMime = 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputMime, 0.78);
          const approxBytes = Math.round((dataUrl.length * 3) / 4);

          const sizeFormatted = approxBytes > 1024 * 1024
            ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(approxBytes / 1024)} KB`;

          let finalName = file.name;
          if (!finalName.toLowerCase().endsWith('.jpg') && !finalName.toLowerCase().endsWith('.jpeg')) {
            finalName = finalName.replace(/\.[^/.]+$/, '') + '.jpg';
          }

          resolve({
            file,
            dataUrl,
            filename: finalName,
            formattedSize: sizeFormatted,
            mimeType: outputMime,
            byteSize: approxBytes
          });
        };

        img.onerror = () => {
          resolve({
            file,
            dataUrl: event.target.result,
            filename: file.name,
            formattedSize: `${Math.round(file.size / 1024)} KB`,
            mimeType: file.type,
            byteSize: file.size
          });
        };

        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleAwardFileChange = async (e) => {
    setAwardFileUploadError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (awardFilesList.length + files.length > 5) {
      setAwardFileUploadError('You can upload a maximum of 5 award files.');
      return;
    }

    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedMimes.includes(file.type.toLowerCase())) {
        setAwardFileUploadError(`File "${file.name}" format not supported. Only PDF, JPG, PNG, and WebP are allowed.`);
        return;
      }
    }

    try {
      const processed = [];
      let currentTotalBytes = awardFilesList.reduce((acc, f) => acc + (f.byteSize || 0), 0);

      for (const file of files) {
        const item = await compressAndProcessFile(file);
        if (item) {
          if (currentTotalBytes + item.byteSize > 3.2 * 1024 * 1024) {
            setAwardFileUploadError('Total combined file size exceeds 3.2MB. Please remove some files or upload smaller documents.');
            break;
          }
          currentTotalBytes += item.byteSize;
          processed.push(item);
        }
      }

      if (processed.length > 0) {
        setAwardFilesList((prev) => [...prev, ...processed]);
      }
    } catch (err) {
      setAwardFileUploadError(err.message || 'Failed to process file upload.');
    } finally {
      e.target.value = '';
    }
  };

  const removeAwardFile = (index) => {
    setAwardFilesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleActivateAccount = async (e) => {
    e.preventDefault();
    if (!activationCodeInput.trim()) {
      setActivationError('Please enter the activation code received from the Telegram bot.');
      return;
    }

    setActivatingAccount(true);
    setActivationError(null);

    try {
      const res = await api.activateAccount(activationCodeInput.trim(), registrationResult?.memberId);
      if (res.alreadyActive) {
        try {
          localStorage.removeItem('arx_pending_registration');
        } catch {}
        setActivatedSuccessData({
          memberId: res.member?.memberId || registrationResult?.memberId || '',
          studentName: res.member?.studentName || registrationResult?.studentName || ''
        });
        return;
      }

      if (res.success && res.member) {
        try {
          localStorage.removeItem('arx_pending_registration');
        } catch {}
        setActivatedSuccessData({
          memberId: res.member.memberId,
          studentName: res.member.studentName
        });
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      } else {
        setActivationError(res.message || 'Activation failed. Please check the code and try again.');
      }
    } catch (err) {
      setActivationError(err.message || 'Failed to activate account. Please check the code.');
    } finally {
      setActivatingAccount(false);
    }
  };

  const handleDismissPending = () => {
    try {
      localStorage.removeItem('arx_pending_registration');
    } catch {}
    setRegistrationResult(null);
    setActivationCodeInput('');
    setActivationError(null);
  };

  useEffect(() => {
    // Check if there is an existing pending registration in this session/browser
    try {
      const savedPending = localStorage.getItem('arx_pending_registration');
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        if (parsed && parsed.memberId) {
          setRegistrationResult(parsed);
        }
      }
    } catch {}

    // 1. Fetch website settings for registration availability
    api.getSettings().
    then((res) => {
      if (res.settings) {
        if (res.settings.registrationStatus === 'CLOSED') {
          setIsRegistrationClosed(true);
          setClosedMessage(
            res.settings.registrationClosedMessage ||
            'Registration for ARX IT CLUB OF SJS is currently closed. Follow @arxitclub for future enrollment notices.'
          );
        }
        if (res.settings.telegramChannelUrl) {
          setChannelUrl(res.settings.telegramChannelUrl);
        }
      }
    }).
    catch(() => {});

    // 2. Fetch available courses dynamically from real database records (Priority B & Requirement 14)
    fetch('/api/courses?forRegistration=true')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          setAvailableCourses(data.courses);
          setForm((prev) => ({ ...prev, courseId: prev.courseId || data.courses[0].id }));
        } else {
          setAvailableCourses(DEFAULT_FALLBACK_COURSES);
          setForm((prev) => ({ ...prev, courseId: prev.courseId || DEFAULT_FALLBACK_COURSES[0].id }));
        }
      })
      .catch((err) => {
        console.warn('Could not load courses from backend API, using default curriculum tracks:', err);
        setAvailableCourses(DEFAULT_FALLBACK_COURSES);
        setForm((prev) => ({ ...prev, courseId: prev.courseId || DEFAULT_FALLBACK_COURSES[0].id }));
      })
      .finally(() => {
        setLoadingCourses(false);
      });
  }, []);

  // Password rules evaluation (Requirement 2 & 3)
  const passwordRules = {
    minLength: form.password.length >= 8,
    hasUpper: /[A-Z]/.test(form.password),
    hasLower: /[a-z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
    hasSpecial: /[^A-Za-z0-9]/.test(form.password)
  };

  const isCommonWeak = [
  'password',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'admin123',
  'welcome123',
  'letmein123',
  'arxitclub'].
  includes(form.password.toLowerCase());

  const satisfiedRulesCount = Object.values(passwordRules).filter(Boolean).length;

  let passwordStrength = 'Too weak';
  if (form.password.length >= 6) {
    if (isCommonWeak || new Set(form.password.split('')).size <= 2 && form.password.length >= 8) {
      passwordStrength = 'Too weak';
    } else if (satisfiedRulesCount === 5) {
      passwordStrength = form.password.length >= 12 && /[^A-Za-z0-9].*[^A-Za-z0-9]/.test(form.password) ? 'Very strong' : 'Strong';
    } else if (satisfiedRulesCount === 4) {
      passwordStrength = 'Fair';
    } else if (satisfiedRulesCount === 3) {
      passwordStrength = 'Weak';
    } else {
      passwordStrength = 'Too weak';
    }
  }

  const passwordsMatch = form.password.length > 0 && form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const [registrationResult, setRegistrationResult] = useState(











    null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Validate course selection
    if (!form.courseId) {
      setErrorMessage('Please choose a course track from the available options.');
      setLoading(false);
      return;
    }

    // Validate grade
    if (!form.class) {
      setErrorMessage('Please select your grade and section (e.g. 11A, 10B).');
      setLoading(false);
      return;
    }

    // Validate password confirmation (Requirement 1, 4, 8)
    if (!form.password) {
      setErrorMessage('Please enter a password.');
      setLoading(false);
      return;
    }

    if (!form.confirmPassword) {
      setErrorMessage('Please confirm your password.');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (satisfiedRulesCount < 5 || isCommonWeak) {
      setErrorMessage('Password does not meet the security requirements. Please choose a stronger password.');
      setLoading(false);
      return;
    }

    const fullName = [form.firstName.trim(), form.secondName.trim(), form.lastName.trim()].
    filter(Boolean).
    join(' ');

    // Check total attachment payload size to prevent Vercel 4.5MB limit (HTTP 413)
    const totalPayloadChars = awardFilesList.reduce((acc, f) => acc + (f.dataUrl ? f.dataUrl.length : 0), 0);
    if (totalPayloadChars > 3.8 * 1024 * 1024) {
      setErrorMessage('The attached documents exceed the maximum upload limit. Please remove an attachment or use smaller files.');
      setLoading(false);
      return;
    }

    try {
      const res = await register({
        firstName: form.firstName.trim(),
        secondName: form.secondName.trim() || undefined,
        lastName: form.lastName.trim(),
        studentName: fullName,
        class: form.class.trim(),
        courseId: form.courseId,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() ? form.email.trim() : undefined,
        telegramUsername: form.telegramUsername.trim(),
        award: form.award.trim() ? form.award.trim() : undefined,
        motivationEssay: form.motivationEssay.trim() ? form.motivationEssay.trim() : undefined,
        awardFiles: awardFilesList.length > 0 ?
        awardFilesList.map((f) => ({
          dataUrl: f.dataUrl,
          filename: f.filename,
          mimeType: f.mimeType
        })) :
        undefined
      });

      if (res && res.memberId) {
        const regPayload = {
          memberId: res.memberId,
          studentName: fullName,
          enrolledCourse: res.course,
          telegramChannelUrl: res.telegramChannelUrl || 'https://t.me/arxitclub',
          telegramChannelName: res.telegramChannelName || '@arxitclub',
          telegramBotUsername: res.telegramBotUsername || 'ARXITCLUB_bot',
          telegramBotUrl: res.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
          activationUrl: res.activationUrl || `${res.telegramBotUrl || 'https://t.me/ARXITCLUB_bot'}?start=${res.activationToken || ''}`,
          activationToken: res.activationToken,
          activationCode: res.activationCode,
          telegramUsername: form.telegramUsername
        };
        setRegistrationResult(regPayload);
        try {
          localStorage.setItem('arx_pending_registration', JSON.stringify(regPayload));
        } catch {}

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {

          // ignore
        }}
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('413') || msg.toLowerCase().includes('payload') || msg.toLowerCase().includes('too large')) {
        setErrorMessage('Attached files are too large for server processing (HTTP 413). Please upload compressed images or files under 2.5MB.');
      } else {
        setErrorMessage(
          err.message || 'Something went wrong while creating your account. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const copyMemberId = () => {
    if (registrationResult?.memberId) {
      navigator.clipboard.writeText(registrationResult.memberId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyActivationCode = () => {
    const code = registrationResult?.activationCode || registrationResult?.activationToken;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // SUCCESS SCREEN
  if (activatedSuccessData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <Card className="p-8 sm:p-10 text-center space-y-6 border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-[#15362B] text-emerald-600 dark:text-[#58B889] border border-emerald-300 dark:border-[#25473C] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-[#58B889] uppercase">
              STATUS // ACTIVATED &amp; VERIFIED
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
              Account Activated!
            </h2>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
              Welcome to <strong>ARX IT CLUB OF SJS</strong>, <strong>{activatedSuccessData.studentName}</strong>. Your Telegram account is linked, and your membership account (<code>{activatedSuccessData.memberId}</code>) is active.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full font-mono text-xs uppercase tracking-wider py-3"
              onClick={() => navigate('/login')}>
              
              Sign In to Member Portal &rarr;
            </Button>
          </div>
        </Card>
      </div>);

  }

  if (registrationResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="p-8 sm:p-10 text-center space-y-6 border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-sm">
          <div className="w-12 h-12 rounded-[2px] bg-emerald-50 dark:bg-[#15362B] text-emerald-600 dark:text-[#58B889] border border-emerald-300 dark:border-[#25473C] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-[#58B889] uppercase">SYS.REGISTER // SUCCESS</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
              Registration Successful
            </h2>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2]">
              Welcome to <strong>ARX IT CLUB OF SJS</strong>, <strong>{registrationResult.studentName}</strong>. Your membership account has been provisioned.
            </p>
          </div>

          {/* Member ID Highlight Box */}
          <div className="bg-[#FAF4EE] dark:bg-[#102B22] text-[#282828] dark:text-[#F1F7F4] rounded-lg p-6 space-y-3 border border-[#282828]/10 dark:border-[#25473C] transition-colors">
            <p className="text-[11px] uppercase tracking-wider text-[#FC6454] dark:text-[#6BB89E] font-mono font-semibold">
              Assigned Member Identifier
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-[#FC6454] dark:text-[#6BB89E] tracking-wider">
                {registrationResult.memberId}
              </span>
              <button
                onClick={copyMemberId}
                className="p-2 rounded-md bg-white dark:bg-[#15362B] hover:bg-[#FC6454]/10 border border-[#282828]/15 dark:border-[#25473C] text-[#282828] dark:text-[#F1F7F4] transition-colors cursor-pointer"
                title="Copy Member ID">
                
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <p className="text-xs font-mono text-emerald-600 dark:text-[#58B889]">Copied to clipboard!</p>}

            {/* Enrolled Track Highlight */}
            {registrationResult.enrolledCourse &&
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-[#15362B] border border-emerald-200 dark:border-[#25473C] rounded-md text-xs font-mono text-emerald-800 dark:text-[#58B889] mt-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-[#58B889]" />
                <span>Enrolled Track: <strong>{registrationResult.enrolledCourse.title}</strong></span>
              </div>
            }

            <div className="pt-2 text-center space-y-1">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Status: Pending Administrator Review
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#282828]/60 dark:text-[#7F9990] pt-1">
                Your application has been submitted and is currently under review by an administrator. Once approved, you will be granted access to the student dashboard.
              </p>
            </div>
          </div>

          {/* Telegram Activation & Channel Section */}
          <div className="bg-[#FAF4EE]/70 dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] rounded-lg p-5 text-left space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#282828] dark:text-[#F1F7F4]">
                Official Telegram Integration
              </h3>
            </div>
            <p className="text-xs text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed">
              Complete these steps to link your student profile with the official <strong>ARX IT CLUB OF SJS Bot</strong> and join the announcements channel:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Step 1: Deep Link to ARX Bot */}
              <div className="p-3.5 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] rounded-md space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#FC6454] dark:text-[#6BB89E] uppercase">STEP 1 · ACCOUNT LINK</span>
                  <p className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mt-0.5">Activate via Bot (@ARXITCLUB_bot)</p>
                  <p className="text-[11px] text-[#282828]/60 dark:text-[#7F9990] mt-1">
                    Authenticates your student ID and connects your Telegram profile.
                  </p>
                </div>
                <a
                  href={registrationResult.activationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#FC6454] dark:bg-[#2F8068] hover:bg-[#e05546] dark:hover:bg-[#3A9277] text-white font-mono text-xs rounded-md transition-colors">
                  
                  <Send className="w-3 h-3" />
                  <span>Activate on Telegram</span>
                </a>
              </div>

              {/* Step 2: Preserved Channel */}
              <div className="p-3.5 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] rounded-md space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#58B889] uppercase">STEP 2 · ANNOUNCEMENTS</span>
                  <p className="text-xs font-bold text-[#282828] dark:text-[#F1F7F4] mt-0.5">Join Channel ({registrationResult.telegramChannelName || '@arxitclub'})</p>
                  <p className="text-[11px] text-[#282828]/60 dark:text-[#7F9990] mt-1">
                    Receive lab schedules, workshop invites, and technical notices.
                  </p>
                </div>
                <a
                  href={registrationResult.telegramChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs rounded-md transition-colors">
                  
                  <Send className="w-3 h-3" />
                  <span>Join {registrationResult.telegramChannelName || '@arxitclub'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* DIRECTLY UNDER THE TELEGRAM ACTIVATION SECTION: ACTIVATION CODE INPUT (Requirement 1) */}
          <div className="bg-[#FAF4EE]/50 dark:bg-[#0A211A]/80 border-2 border-[#FC6454]/40 dark:border-[#2F8068]/80 rounded-xl p-5 sm:p-6 text-left space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FC6454]/10 dark:bg-[#2F8068]/20 text-[#FC6454] dark:text-[#6BB89E] flex items-center justify-center border border-[#FC6454]/20 dark:border-[#2F8068]/40">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#282828] dark:text-[#F1F7F4]">
                  Activate with Telegram
                </h3>
                <p className="text-[11px] font-mono text-[#282828]/60 dark:text-[#7F9990]">
                  Enter the activation code delivered by the Telegram bot
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#102B22] rounded-lg border border-[#282828]/10 dark:border-[#25473C] space-y-1.5 text-xs text-[#282828]/80 dark:text-[#B7C9C2]">
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed pl-1 text-xs">
                <li>Open the <strong>ARX IT CLUB OF SJS Telegram Bot</strong></li>
                <li>Complete the verification process in Telegram</li>
                <li>The bot will send you your activation code</li>
                <li>Return here and enter that code below</li>
              </ol>
            </div>

            {activationError &&
            <div className="p-3 rounded-md bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-rose-400" />
                <span>{activationError}</span>
              </div>
            }

            <form onSubmit={handleActivateAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                  Enter activation code
                </label>
                <input
                  type="text"
                  required
                  placeholder="ARX-ACT-XXXX"
                  value={activationCodeInput}
                  onChange={(e) => setActivationCodeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#282828]/20 dark:border-[#294B40] text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FC6454]/40 dark:focus:ring-[#6BB89E]/40 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal" />
                
                <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
                  Format: <code className="font-mono font-bold text-[#FC6454] dark:text-[#6BB89E]">ARX-ACT-XXXX</code> &bull; Expires in 5 minutes &bull; Single-use
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={activatingAccount}
                className="w-full text-xs font-mono uppercase tracking-wider py-2.5">
                
                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                Activate Account
              </Button>
            </form>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="md"
                className="flex-1 font-mono text-xs"
                onClick={() => navigate('/activate')}>
                
                <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                Go to Dedicated Activation Page
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => navigate('/login')}>
                
                Sign In to Portal &rarr;
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#282828]/50 dark:text-[#7F9990] pt-1">
              <span>Activation codes delivered solely via Telegram bot.</span>
              <button
                type="button"
                onClick={handleDismissPending}
                className="text-[#FC6454] dark:text-[#6BB89E] hover:underline cursor-pointer">
                
                Register another member &rarr;
              </button>
            </div>
          </div>
        </Card>
      </div>);

  }

  // REGISTRATION CLOSED STATE
  if (isRegistrationClosed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[2px] text-[11px] font-mono tracking-widest uppercase text-amber-800 dark:text-[#D6A84F]">
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-[#D6A84F]" />
            REGISTRATION // CURRENTLY CLOSED
          </div>
          <h1 className="text-3xl font-bold text-[#282828] dark:text-[#F1F7F4] tracking-tight">
            Admissions Are Closed
          </h1>
          <p className="text-xs sm:text-sm text-[#282828]/70 dark:text-[#B7C9C2] max-w-md mx-auto">
            Public applicant registration is currently closed for the active club term.
          </p>
        </div>

        <Card className="p-6 sm:p-8 rounded-[2px] border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-[#102B22] space-y-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-[#15362B] flex items-center justify-center text-amber-600 dark:text-[#D6A84F]">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#282828] dark:text-[#F1F7F4]">
              Registration Lifecycle Notice
            </h2>
            <p className="text-sm text-[#282828]/70 dark:text-[#B7C9C2] leading-relaxed font-sans max-w-sm mx-auto">
              {closedMessage ||
              'Registration is currently closed. Thank you for your interest in ARX IT CLUB OF SJS. New member registration will reopen when the club announces the next registration period.'}
            </p>
          </div>

          <div className="p-4 bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] rounded-[2px] text-xs font-mono text-[#282828]/70 dark:text-[#B7C9C2] text-left space-y-2">
            <p className="font-bold text-[#282828] dark:text-[#F1F7F4] uppercase text-[10px]">What can you do?</p>
            <p>&bull; If you already registered, you can log in to your portal using your Member ID.</p>
            <p>&bull; If you need notifications on the next admission period, subscribe to our official Telegram channel.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/login')}
              className="flex-1">
              
              Sign In to Existing Account
            </Button>
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1">
              
              <Button
                variant="primary"
                size="md"
                className="w-full inline-flex items-center justify-center gap-2">
                
                Join Official Channel (@arxitclub) <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </Card>
      </div>);

  }

  // REGISTRATION FORM
  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2.5">
        <span className="text-xs font-mono text-[#FC6454] dark:text-[#FD8072] uppercase tracking-wider">
          MEMBER ADMISSIONS · 2026 CYCLE
        </span>
        <h1 className="text-3xl font-bold text-[#282828] dark:text-white tracking-tight">
          Join ARX IT CLUB OF SJS
        </h1>
        <p className="text-xs sm:text-sm text-[#282828]/70 dark:text-[#F7EFE8]/75 max-w-md mx-auto">
          Become a verified member of our community. Learn technology, build practical projects, and collaborate.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-xl border border-[#282828]/10 dark:border-[#25473C] bg-white dark:bg-[#102B22] shadow-xs transition-colors">
        {errorMessage &&
        <div className="mb-6 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Three Separate Name Fields per Requirement */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>

            <div>
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                Second Name
              </label>
              <input
                type="text"
                placeholder="Second Name"
                value={form.secondName}
                onChange={(e) => setForm({ ...form, secondName: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>

            <div>
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>
          </div>

          {/* Classroom / Grade Selector (Requirement 11: 9A-9E, 10A-10E, 11A-11E, 12A-12E) */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Classroom & Section <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]">
              
              <option value="">Select Grade & Section (e.g. 11A)</option>
              {GRADE_SECTIONS.map((grp) =>
              <optgroup key={grp.grade} label={grp.grade}>
                  {grp.sections.map((sec) =>
                <option key={sec} value={sec}>
                      {sec} ({grp.grade})
                    </option>
                )}
                </optgroup>
              )}
            </select>
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Supported sections: Grades 9A–9E, 10A–10E, 11A–11E, and 12A–12E.
            </p>
          </div>

          {/* Dynamic Course Selection (Priority B & Requirement 14) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">
                Choose a Course <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-[#FC6454] dark:text-[#6BB89E]">Database-backed tracks</span>
            </div>
            {loadingCourses ?
            <div className="p-3 bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] rounded-md text-xs text-[#282828]/60 dark:text-[#7F9990]">
                Loading available curriculum tracks from database...
              </div> :
            availableCourses.length === 0 ?
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md text-xs text-amber-800 dark:text-amber-300">
                No courses are currently open for new registration. Please check back soon.
              </div> :

            <select
              required
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] font-medium">
              
                <option value="">-- Select Your Technical Course Track --</option>
                {availableCourses.map((c) =>
              <option key={c.id} value={c.id}>
                    {c.title} · {c.category} ({c.duration})
                  </option>
              )}
              </select>
            }
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Your student membership will automatically be enrolled in this track upon account creation.
            </p>
          </div>

          {/* Ethiopian Phone Number (Requirement 10: +251XXXXXXXXX) */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Phone Number (Ethiopian Mobile) <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-md border border-[#282828]/20 dark:border-[#294B40] focus-within:ring-2 focus-within:ring-[#FC6454]/30 dark:focus-within:ring-[#6BB89E]/30 overflow-hidden bg-white dark:bg-[#0C241C]">
              <span className="inline-flex items-center px-3 bg-[#FAF4EE] dark:bg-[#15362B] text-[#282828]/70 dark:text-[#B7C9C2] font-mono text-xs border-r border-[#282828]/20 dark:border-[#294B40] select-none">
                +251
              </span>
              <input
                type="tel"
                required
                placeholder="911 234 567"
                value={form.phoneNumber.replace(/^\+251/, '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d\s\-]/g, '');
                  setForm({ ...form, phoneNumber: raw });
                }}
                className="flex-1 px-3 py-2 text-xs font-mono focus:outline-none bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Enter the 9 digits following +251 (e.g. 911 234 567). Normalized securely on the server.
            </p>
          </div>

          {/* Optional Email Address (Requirement 12) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">
                Email Address
              </label>
              <span className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Optional</span>
            </div>
            <input
              type="email"
              placeholder="e.g. student@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
            
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Optional for email announcements and certificate duplicates.
            </p>
          </div>

          {/* Telegram Username */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Telegram Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#282828]/40 dark:text-[#7F9990] text-xs font-mono">
                @
              </span>
              <input
                type="text"
                required
                placeholder="username"
                value={form.telegramUsername.replace(/^@/, '')}
                onChange={(e) =>
                setForm({ ...form, telegramUsername: `@${e.target.value.replace(/^@/, '')}` })
                }
                className="w-full pl-7 pr-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990] mt-1">
              Used for official bot activation (@ARXITCLUB_bot) and @arxitclub channel verification.
            </p>
          </div>

          {/* Password (Requirement 1, 2, 3, 5, 6) */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="e.g. Arx@Club2026!"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-3 pr-11 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]"
                autoComplete="new-password" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-[#282828]/40 hover:text-[#282828] dark:hover:text-[#F1F7F4] focus:outline-none cursor-pointer">
                
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator (Requirement 3) */}
            {form.password &&
            <div className="mt-2.5 p-3 rounded-md bg-[#FAF4EE] dark:bg-[#0A211A] border border-[#282828]/10 dark:border-[#25473C] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-[#282828]/60 dark:text-[#7F9990]">Password Strength:</span>
                  <span
                  className={`text-[11px] font-bold ${
                  passwordStrength === 'Very strong' ?
                  'text-cyan-600 dark:text-[#58B889]' :
                  passwordStrength === 'Strong' ?
                  'text-emerald-600 dark:text-[#58B889]' :
                  passwordStrength === 'Fair' ?
                  'text-amber-600 dark:text-[#D6A84F]' :
                  passwordStrength === 'Weak' ?
                  'text-orange-600 dark:text-orange-400' :
                  'text-rose-600 dark:text-rose-400'}`
                  }>
                  
                    {passwordStrength}
                  </span>
                </div>

                {/* Discrete 5-bar meter */}
                <div className="grid grid-cols-5 gap-1.5 h-1.5">
                  <div
                  className={`h-full rounded-sm transition-colors ${
                  passwordStrength === 'Too weak' ?
                  'bg-rose-500' :
                  passwordStrength === 'Weak' ?
                  'bg-orange-500' :
                  passwordStrength === 'Fair' ?
                  'bg-amber-500' :
                  passwordStrength === 'Strong' ?
                  'bg-emerald-500' :
                  'bg-cyan-500'}`
                  } />
                
                  <div
                  className={`h-full rounded-sm transition-colors ${
                  ['Weak', 'Fair', 'Strong', 'Very strong'].includes(passwordStrength) ?
                  passwordStrength === 'Weak' ?
                  'bg-orange-500' :
                  passwordStrength === 'Fair' ?
                  'bg-amber-500' :
                  passwordStrength === 'Strong' ?
                  'bg-emerald-500' :
                  'bg-emerald-600' :
                  'bg-[#282828]/15 dark:bg-[#25473C]'}`
                  } />
                
                  <div
                  className={`h-full rounded-sm transition-colors ${
                  ['Fair', 'Strong', 'Very strong'].includes(passwordStrength) ?
                  passwordStrength === 'Fair' ?
                  'bg-amber-500' :
                  passwordStrength === 'Strong' ?
                  'bg-emerald-500' :
                  'bg-emerald-600' :
                  'bg-[#282828]/15 dark:bg-[#25473C]'}`
                  } />
                
                  <div
                  className={`h-full rounded-sm transition-colors ${
                  ['Strong', 'Very strong'].includes(passwordStrength) ?
                  passwordStrength === 'Strong' ?
                  'bg-emerald-500' :
                  'bg-emerald-600' :
                  'bg-[#282828]/15 dark:bg-[#25473C]'}`
                  } />
                
                  <div
                  className={`h-full rounded-sm transition-colors ${
                  passwordStrength === 'Very strong' ? 'bg-emerald-600' : 'bg-[#282828]/15 dark:bg-[#25473C]'}`
                  } />
                
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px] font-mono">
                  <div
                  className={`flex items-center gap-1.5 ${
                  passwordRules.minLength ? 'text-emerald-700 font-medium' : 'text-[#282828]/50 dark:text-[#7F9990]'}`
                  }>
                  
                    {passwordRules.minLength ?
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> :

                  <span className="w-3.5 text-center text-slate-300">•</span>
                  }
                    <span>At least 8 characters</span>
                  </div>
                  <div
                  className={`flex items-center gap-1.5 ${
                  passwordRules.hasUpper ? 'text-emerald-700 font-medium' : 'text-slate-400'}`
                  }>
                  
                    {passwordRules.hasUpper ?
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> :

                  <span className="w-3.5 text-center text-slate-300">•</span>
                  }
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div
                  className={`flex items-center gap-1.5 ${
                  passwordRules.hasLower ? 'text-emerald-700 font-medium' : 'text-slate-400'}`
                  }>
                  
                    {passwordRules.hasLower ?
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> :

                  <span className="w-3.5 text-center text-slate-300">•</span>
                  }
                    <span>Lowercase letter (a-z)</span>
                  </div>
                  <div
                  className={`flex items-center gap-1.5 ${
                  passwordRules.hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`
                  }>
                  
                    {passwordRules.hasNumber ?
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> :

                  <span className="w-3.5 text-center text-slate-300">•</span>
                  }
                    <span>Number (0-9)</span>
                  </div>
                  <div
                  className={`flex items-center gap-1.5 sm:col-span-2 ${
                  passwordRules.hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-400'}`
                  }>
                  
                    {passwordRules.hasSpecial ?
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> :

                  <span className="w-3.5 text-center text-slate-300">•</span>
                  }
                    <span>Special character (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>
            }
          </div>

          {/* Confirm Password (Requirement 1, 4, 5, 6) */}
          <div>
            <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2] mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`w-full pl-3 pr-11 py-2 rounded-md border text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] ${
                passwordsMismatch ?
                'border-rose-400 focus:border-rose-500' :
                passwordsMatch ?
                'border-emerald-400 focus:border-emerald-500' :
                'border-[#282828]/20 dark:border-[#294B40] focus:border-[#FC6454] dark:focus:border-[#6BB89E]'}`
                }
                autoComplete="new-password" />
              
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-[#282828]/40 hover:text-[#282828] dark:hover:text-[#F1F7F4] focus:outline-none cursor-pointer">
                
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passwordsMismatch &&
            <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Passwords do not match.</span>
              </p>
            }
            {passwordsMatch &&
            <p className="text-[11px] font-mono text-emerald-600 dark:text-[#58B889] mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Passwords match.</span>
              </p>
            }
          </div>

          {/* Motivation Essay */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#282828]/80 dark:text-[#B7C9C2]">
                Why do you want to join ARX IT CLUB OF SJS?
              </label>
              <span className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Required</span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Tell us about your interest in technology, what you hope to learn, and why you'd be a great fit for ARX IT CLUB OF SJS..."
              value={form.motivationEssay}
              onChange={(e) => setForm({ ...form, motivationEssay: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4] resize-none leading-relaxed" />
            <p className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">
              Min. 30 characters. This will be reviewed by club admins.
            </p>
          </div>

          {/* Award / Prior Tech Experience & File Uploads */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#282828]/80 dark:text-[#B7C9C2]">
                  Award / Prior Tech Experience
                </label>
                <span className="text-[11px] text-[#282828]/50 dark:text-[#7F9990]">Optional</span>
              </div>
              <input
                type="text"
                placeholder="e.g. 1st Place School Science Fair or Self-Taught Python"
                value={form.award}
                onChange={(e) => setForm({ ...form, award: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#282828]/20 dark:border-[#294B40] text-xs focus:outline-none focus:ring-2 focus:ring-[#FC6454]/30 dark:focus:ring-[#6BB89E]/30 bg-white dark:bg-[#0C241C] text-[#282828] dark:text-[#F1F7F4]" />
              
            </div>

            {/* Award Documents / Certificates Upload */}
            <div className="p-3.5 bg-[#FAF4EE]/60 dark:bg-[#0A211A]/60 border border-[#282828]/10 dark:border-[#25473C] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#282828] dark:text-[#F1F7F4]">
                  Upload Award Certificates / Evidence
                </label>
                <span className="text-[10px] font-mono text-[#282828]/50 dark:text-[#7F9990]">
                  PDF, JPG, PNG, WebP (Max 5, up to 2.5MB each. Photos auto-optimized)
                </span>
              </div>
              <p className="text-[11px] text-[#282828]/60 dark:text-[#7F9990]">
                Optional: Upload certificates or achievements for admin review.
              </p>

              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#282828]/20 dark:border-[#294B40] hover:border-[#FC6454] dark:hover:border-[#6BB89E] rounded-md cursor-pointer bg-white dark:bg-[#102B22] transition-colors">
                <UploadCloud className="w-5 h-5 text-[#FC6454] dark:text-[#6BB89E] mb-1" />
                <span className="text-xs font-medium text-[#282828] dark:text-[#F1F7F4]">
                  Select Certificate / Award Files
                </span>
                <span className="text-[10px] text-[#282828]/50 dark:text-[#7F9990] mt-0.5">
                  Click to browse from your device
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleAwardFileChange} />
                
              </label>

              {awardFileUploadError &&
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{awardFileUploadError}</span>
                </p>
              }

              {awardFilesList.length > 0 &&
              <div className="mt-2 space-y-1.5">
                  {awardFilesList.map((fileItem, idx) =>
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#102B22] border border-[#282828]/10 dark:border-[#25473C] rounded-md text-xs">
                  
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#FC6454] dark:text-[#6BB89E] shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs font-mono text-[#282828] dark:text-[#F1F7F4]">
                          {fileItem.filename}
                        </span>
                        <span className="text-[10px] font-mono text-[#282828]/50 dark:text-[#7F9990]">
                          ({fileItem.formattedSize})
                        </span>
                      </div>
                      <button
                    type="button"
                    onClick={() => removeAwardFile(idx)}
                    className="p-1 text-[#282828]/40 hover:text-rose-600 dark:text-[#7F9990] dark:hover:text-rose-400 cursor-pointer"
                    title="Remove file">
                    
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                )}
                </div>
              }
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={loadingCourses || availableCourses.length === 0}
              className="w-full">
              
              Complete Registration
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#282828]/10 dark:border-[#25473C] text-center text-xs text-[#282828]/60 dark:text-[#B7C9C2]">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#FC6454] dark:text-[#6BB89E] font-semibold hover:underline cursor-pointer">
            
            Login with Member ID &rarr;
          </button>
        </div>
      </div>
    </div>);

};