import 'dotenv/config';
import { db } from '../src/services/db.js';
import { authController, normalizeEthiopianPhone } from '../src/controllers/authController.js';
import { courseController } from '../src/controllers/courseController.js';
import { processTelegramUpdate } from '../src/controllers/telegramController.js';

// Mock Express Request & Response helper
function createMockReqRes(body = {}, params = {}, query = {}, user = null) {
  let statusCode = 200;
  let responseData = null;

  const req = {
    body,
    params,
    query,
    user
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    }
  };

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getResponseData: () => responseData
  };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('ARX IT CLUB OF SJS — REGISTRATION & COURSE LIFECYCLE VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testId, description, detail) {
    if (condition) {
      console.log(`✅ [${testId}] PASS: ${description} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [${testId}] FAIL: ${description} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Phone Normalization Unit Tests
  {
    const p1 = normalizeEthiopianPhone('+251 911 234 567');
    assert(p1.valid && p1.normalized === '+251911234567', 'PHONE-1', 'Normalizes spaced +251 format');

    const p2 = normalizeEthiopianPhone('0911234567');
    assert(p2.valid && p2.normalized === '+251911234567', 'PHONE-2', 'Normalizes leading 0 format (0911234567)');

    const p3 = normalizeEthiopianPhone('911234567');
    assert(p3.valid && p3.normalized === '+251911234567', 'PHONE-3', 'Normalizes 9-digit format without prefix');

    const p4 = normalizeEthiopianPhone('+251+251911234567');
    assert(p4.valid && p4.normalized === '+251911234567', 'PHONE-4', 'Strips accidental double prefix (+251+251)');

    const p5 = normalizeEthiopianPhone('12345');
    assert(!p5.valid, 'PHONE-5', 'Rejects phone with insufficient digits');
  }

  // 2. Registration OPEN — Successful registration with dynamic course selection & ARX ID
  db.setRegistrationStatus('OPEN');
  let regToken = '';
  let regMemberId = '';
  let regUserId = '';
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      firstName: 'Abebe',
      secondName: 'Bikila',
      lastName: 'Kebede',
      class: '11A',
      courseId: 'crs_python',
      phoneNumber: '+251 922 111 222',
      email: 'abebe.test@arxitclub.org',
      telegramUsername: '@abebe_tele',
      password: 'Arx@Club2026!',
      confirmPassword: 'Arx@Club2026!'
    });

    authController.register(req, res);
    const code = getStatusCode();
    const data = getResponseData();

    assert(code === 201 && data.success === true, 'REG-1', 'Valid applicant registration succeeds with HTTP 201');
    assert(data.memberId && data.memberId.startsWith('ARX-'), 'REG-2', 'Generates official ARX member ID', data.memberId);
    assert(data.enrollment && data.enrollment.courseId === 'crs_python', 'REG-3', 'Automatically enrolls member into chosen course');
    assert(data.activation && Boolean(data.activation.token), 'REG-4', 'Creates secure activation session');
    assert(data.activationUrl && data.activationUrl.includes('start='), 'REG-5', 'Builds official Telegram bot deep link');

    regToken = data.activation.token;
    regMemberId = data.memberId;
    regUserId = data.member.id;
  }

  // 3. Grade Validation Tests (Section 11)
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      firstName: 'Invalid',
      lastName: 'GradeUser',
      class: '8Z', // Invalid grade
      courseId: 'crs_python',
      phoneNumber: '+251 933 000 111',
      telegramUsername: '@invalid_grade',
      password: 'Arx@Club2026!',
      confirmPassword: 'Arx@Club2026!'
    });

    authController.register(req, res);
    assert(getStatusCode() === 400 && getResponseData().error.includes('Grade'), 'GRADE-1', 'Rejects unauthorized grade section (8Z)');
  }

  // 4. Duplicate Phone Prevention (Section 10)
  {
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      firstName: 'Duplicate',
      lastName: 'PhoneUser',
      class: '10C',
      courseId: 'crs_javascript',
      phoneNumber: '0922111222', // Same phone as Abebe (+251922111222)
      telegramUsername: '@dup_phone',
      password: 'Arx@Club2026!',
      confirmPassword: 'Arx@Club2026!'
    });

    authController.register(req, res);
    assert(getStatusCode() === 409 && getResponseData().error.includes('phone number is already registered'), 'DUP-1', 'Rejects duplicate phone number with HTTP 409');
  }

  // 5. Course Registration Availability & Dynamic Course Selection (Section 14 & Priority B)
  {
    // Fetch courses for registration
    const { req, res, getResponseData } = createMockReqRes({}, {}, { forRegistration: 'true' });
    courseController.getCourses(req, res);
    const data = getResponseData();
    assert(Array.isArray(data.courses) && data.courses.length > 0, 'COURSE-1', 'Retrieves database-backed courses for registration');

    // Make crs_cybersecurity unavailable for new registration
    db.updateCourse('crs_cybersecurity', { isAvailableForRegistration: false });

    // Verify it disappears from registration options
    const { req: req2, res: res2, getResponseData: getResponseData2 } = createMockReqRes({}, {}, { forRegistration: 'true' });
    courseController.getCourses(req2, res2);
    const coursesAfter = getResponseData2().courses;
    assert(!coursesAfter.some((c) => c.id === 'crs_cybersecurity'), 'COURSE-2', 'Closed course is excluded from registration options');

    // Attempt to register with the closed course -> rejected by backend
    const { req: req3, res: res3, getStatusCode: getCode3 } = createMockReqRes({
      firstName: 'Attempt',
      lastName: 'ClosedCourse',
      class: '12D',
      courseId: 'crs_cybersecurity',
      phoneNumber: '+251 944 555 666',
      telegramUsername: '@attempt_closed',
      password: 'Arx@Club2026!',
      confirmPassword: 'Arx@Club2026!'
    });
    authController.register(req3, res3);
    assert(getCode3() === 400, 'COURSE-3', 'Backend independently rejects registration for closed course');

    // Restore course availability
    db.updateCourse('crs_cybersecurity', { isAvailableForRegistration: true });
    const { req: req4, res: res4, getResponseData: getResponseData4 } = createMockReqRes({}, {}, { forRegistration: 'true' });
    courseController.getCourses(req4, res4);
    assert(getResponseData4().courses.some((c) => c.id === 'crs_cybersecurity'), 'COURSE-4', 'Re-opening course makes it selectable again immediately');
  }

  // 6. Registration CLOSED — Admin Control & Backend Enforcement (Section 13 & Priority A)
  {
    // Admin closes registration
    db.setRegistrationStatus('CLOSED', 'Admissions for ARX IT CLUB OF SJS are officially closed for this term.');

    // Direct registration API attempt must be blocked with HTTP 403
    const { req, res, getStatusCode, getResponseData } = createMockReqRes({
      firstName: 'Blocked',
      lastName: 'Applicant',
      class: '10A',
      courseId: 'crs_html_css',
      phoneNumber: '+251 955 666 777',
      telegramUsername: '@blocked_applicant',
      password: 'Arx@Club2026!',
      confirmPassword: 'Arx@Club2026!'
    });

    authController.register(req, res);
    assert(getStatusCode() === 403, 'REG-CLOSED-1', 'Direct API registration rejected with HTTP 403 when registration is CLOSED');
    assert(getResponseData().error.includes('closed'), 'REG-CLOSED-2', 'Returns custom closed message to user');

    // Verify existing member can still log in
    const { req: loginReq, res: loginRes, getStatusCode: loginCode, getResponseData: loginData } = createMockReqRes({
      memberId: regMemberId,
      password: 'Arx@Club2026!'
    });
    authController.login(loginReq, loginRes);
    assert(loginCode() === 200 && loginData().success === true, 'REG-CLOSED-3', 'Existing members remain intact and can log in normally');
  }

  // 7. Telegram Activation Workflow (Requirement 1, 2, 3)
  {
    // Step 1: User opens official bot with the activation token (/start <token>)
    const update = {
      update_id: 99001,
      message: {
        message_id: 501,
        chat: { id: 888777, type: 'private' },
        from: { id: 888777, is_bot: false, first_name: 'Abebe', username: 'abebe_tele' },
        text: `/start ${regToken}`
      }
    };

    const resTelegram = await processTelegramUpdate(update);
    assert(
      resTelegram.handled && resTelegram.action === 'START_WITH_TOKEN_WELCOME_SENT',
      'TG-1',
      'Telegram /start resolves real activation session and prompts channel join without prematurely activating'
    );

    const pendingMember = db.findMemberById(regUserId);
    assert(pendingMember?.telegramActivated !== true, 'TG-2', 'Member remains pending verification before code entry');

    // Step 2: User clicks "I Joined the Channel"
    const cbUpdate = {
      update_id: 99002,
      callback_query: {
        id: 'cb_channel_reg',
        from: { id: 888777, username: 'abebe_tele' },
        message: { chat: { id: 888777 } },
        data: `verify_channel:${regToken}`
      }
    };
    const resCb = await processTelegramUpdate(cbUpdate);
    assert(resCb.handled && resCb.action === 'CALLBACK_VERIFY_CHANNEL_SUCCESS', 'TG-3', 'Channel membership verified and bot prompts for Member ID');

    // Step 3: User replies with Member ID
    const idUpdate = {
      update_id: 99003,
      message: {
        message_id: 502,
        chat: { id: 888777, type: 'private' },
        from: { id: 888777, username: 'abebe_tele' },
        text: regMemberId
      }
    };
    const resId = await processTelegramUpdate(idUpdate);
    const generatedCode = resId.details?.code || '';
    assert(
      resId.handled &&
      resId.action === 'MEMBER_ID_VERIFIED_CODE_ISSUED' &&
      Boolean(generatedCode) &&
      /^ARX-ACT-\d{4}$/.test(generatedCode),
      'TG-4',
      'Bot issues single-use 5-minute ARX-ACT-XXXX activation code'
    );

    // Step 4: User enters code on website -> server validates and activates
    const activateRes = db.activateAccountByCode(generatedCode);
    assert(activateRes.success && activateRes.code === 'ACTIVATED', 'TG-5', 'Website validates code and activates account');

    const updatedMember = db.findMemberById(regUserId);
    assert(updatedMember?.telegramActivated === true, 'TG-6', 'Member account state updated to telegramActivated: true');
    assert(updatedMember?.telegramUserId === 888777, 'TG-7', 'Authoritative numeric Telegram User ID securely linked');
  }

  // Restore registration status to OPEN
  db.setRegistrationStatus('OPEN');

  console.log('\n================================================================');
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((e) => {
  console.error('Test suite runner crashed:', e);
  process.exit(1);
});