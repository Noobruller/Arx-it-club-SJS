import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { db } from '../src/services/db.js';
import { authController } from '../src/controllers/authController.js';
import { adminController } from '../src/controllers/adminController.js';
import { telegramController, processTelegramUpdate } from '../src/controllers/telegramController.js';
import { validateAndSaveAwardFile } from '../src/utils/awardFileUtils.js';

function createMockReqRes(body = {}, params = {}, query = {}, user = null, headers = {}) {
  let statusCode = 200;
  let responseData = null;
  const resHeaders = {};

  const req = {
    body,
    params,
    query,
    user,
    headers: { ...headers },
    socket: { remoteAddress: '127.0.0.1' }
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    send(data) {
      responseData = data;
      return res;
    },
    setHeader(key, val) {
      resHeaders[key] = val;
    },
    sendFile(filePath) {
      responseData = { sentFile: filePath, headers: resHeaders };
    }
  };

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getResponseData: () => responseData
  };
}

async function runCriticalVerification() {
  console.log('================================================================');
  console.log('ARX IT CLUB OF SJS — FULL END-TO-END SPECIFICATION TESTS (TESTS 1 - 9)');
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

  db.setRegistrationStatus('OPEN');

  // =================================================================
  // TEST 8: INVALID AWARD FILE (Security & Magic Bytes)
  // =================================================================
  console.log('--- TEST 8: Invalid / Dangerous Award File Rejection ---');
  // Attempt executable with spoofed .pdf extension
  const fakePdfExe = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff'); // PE executable signature
  const fakePdfRes = validateAndSaveAwardFile({
    base64: fakePdfExe.toString('base64'),
    filename: 'malicious.pdf',
    mimeType: 'application/pdf'
  });
  assert(
    !fakePdfRes.success && Boolean(fakePdfRes.error),
    'TEST-8',
    'Attempt unsupported/dangerous file type rejected securely via server-side magic byte inspection'
  );

  // =================================================================
  // TEST 9: REGISTRATION WITHOUT AWARDS (Awards are optional)
  // =================================================================
  console.log('\n--- TEST 9: Registration Without Awards ---');
  const { req: noAwardReq, res: noAwardRes, getStatusCode: noAwardCode, getResponseData: noAwardData } = createMockReqRes({
    firstName: 'Nahom',
    lastName: 'Tadesse',
    class: '9A',
    courseId: 'crs_html_css',
    phoneNumber: '+251 911 200 300',
    telegramUsername: '@nahom_tech',
    password: 'Arx@Club2026!',
    confirmPassword: 'Arx@Club2026!'
    // No award field and no awardFiles
  });
  authController.register(noAwardReq, noAwardRes);
  assert(
    noAwardCode() === 201 && noAwardData().success && Boolean(noAwardData().memberId),
    'TEST-9',
    'Registration without awards succeeds normally (awards are optional)'
  );

  // =================================================================
  // TEST 7: AWARD UPLOAD & ADMIN ACCESS
  // =================================================================
  console.log('\n--- TEST 7: Award File Upload & Authorized Admin Access ---');
  const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

  const { req: regWithAwardsReq, res: regWithAwardsRes, getStatusCode: regAwardsCode, getResponseData: regAwardsData } = createMockReqRes({
    firstName: 'Kidus',
    lastName: 'Yohannes',
    class: '10B',
    courseId: 'crs_python',
    phoneNumber: '+251 911 333 444',
    email: 'kidus@arxitclub.org',
    telegramUsername: '@kidus_coder',
    password: 'Arx@Club2026!',
    confirmPassword: 'Arx@Club2026!',
    award: 'National Robotics Olympiad Finalist',
    awardFiles: [
    {
      dataUrl: `data:application/pdf;base64,${validPdfBuffer.toString('base64')}`,
      filename: 'National_Robotics_Certificate.pdf',
      mimeType: 'application/pdf'
    },
    {
      dataUrl: `data:image/png;base64,${validPngBuffer.toString('base64')}`,
      filename: 'olympiad_medal.png',
      mimeType: 'image/png'
    }]

  });

  authController.register(regWithAwardsReq, regWithAwardsRes);
  const applicantMemberId = regAwardsData().memberId;
  const applicantUserId = regAwardsData().member.id;
  const applicantSessionToken = regAwardsData().activation.token;

  assert(regAwardsCode() === 201 && regAwardsData().success, 'TEST-7A', 'Applicant registers with multiple valid award files (PDF & PNG)');
  assert(
    regAwardsData().member.awardFiles && regAwardsData().member.awardFiles.length === 2,
    'TEST-7B',
    'Award files successfully associated with the correct applicant record'
  );
  assert(
    regAwardsData().activation.activationCode === undefined,
    'TEST-7C',
    'Activation code is NOT returned automatically on registration page'
  );

  // Admin access test
  const adminUser = { id: 'admin_1', memberId: 'ADMIN01', role: 'admin' };
  const { req: detailReq, res: detailRes, getResponseData: detailData } = createMockReqRes({}, { id: applicantUserId }, {}, adminUser);
  adminController.getMemberDetail(detailReq, detailRes);
  const awardFilesList = detailData().awardFiles;

  assert(
    Array.isArray(awardFilesList) && awardFilesList.length === 2,
    'TEST-7D',
    'Authorized admin can view applicant uploaded award files list'
  );

  const fileToDownload = awardFilesList[0];
  const { req: dlReq, res: dlRes, getResponseData: dlData } = createMockReqRes({}, { id: fileToDownload.id }, {}, adminUser);
  adminController.downloadAwardFile(dlReq, dlRes);
  assert(
    dlData()?.sentFile === fileToDownload.storagePath,
    'TEST-7E',
    'Authorized admin can securely download applicant award file'
  );

  // Verify that GET /api/telegram/activation-session/:token does NOT leak activation secrets
  const { req: sessReq, res: sessRes, getResponseData: sessData } = createMockReqRes({}, { token: applicantSessionToken });
  telegramController.getActivationSession(sessReq, sessRes);
  assert(
    sessData()?.session?.activationCode === undefined && sessData()?.session?.shortCode === undefined,
    'SECURITY-SECRETS',
    'Public activation-session endpoint does NOT expose activationCode or shortCode secrets'
  );

  // =================================================================
  // TEST 5: WRONG TELEGRAM ACCOUNT
  // =================================================================
  console.log('\n--- TEST 5: Wrong / Unauthorized Telegram Account Rejection ---');
  const tgMismatchUpdate = {
    update_id: 81001,
    message: {
      message_id: 1,
      chat: { id: 777002, type: 'private' },
      from: { id: 777002, username: 'imposter_user', first_name: 'Imposter' },
      text: `/start ${applicantSessionToken}`
    }
  };
  const resMismatch = await processTelegramUpdate(tgMismatchUpdate);
  assert(
    resMismatch.handled && resMismatch.action === 'START_WITH_TOKEN_USERNAME_MISMATCH',
    'TEST-5A',
    'Activation rejected when Telegram username does not match registered Telegram username'
  );

  const pendingMemberCheck = db.findMemberById(applicantUserId);
  assert(
    pendingMemberCheck?.telegramActivated !== true && pendingMemberCheck?.telegramUserId === undefined,
    'TEST-5B',
    'No unauthorized account linking occurs'
  );

  // =================================================================
  // TEST 1: NORMAL ACTIVATION FLOW
  // =================================================================
  console.log('\n--- TEST 1: Normal Complete Activation Flow ---');
  // 1.1 Correct Telegram user sends /start <token>
  const tgStartUpdate = {
    update_id: 81002,
    message: {
      message_id: 2,
      chat: { id: 777001, type: 'private' },
      from: { id: 777001, username: 'kidus_coder', first_name: 'Kidus' },
      text: `/start ${applicantSessionToken}`
    }
  };
  const resStart = await processTelegramUpdate(tgStartUpdate);
  assert(
    resStart.handled && resStart.action === 'START_WITH_TOKEN_WELCOME_SENT',
    'TEST-1A',
    'Bot FIRST sends welcome message and asks user to join channel'
  );

  // 1.2 User clicks "I Joined the Channel"
  const tgVerifyChannelUpdate = {
    update_id: 81003,
    callback_query: {
      id: 'cb_test_kidus_1',
      from: { id: 777001, username: 'kidus_coder' },
      message: { chat: { id: 777001 } },
      data: `verify_channel:${applicantSessionToken}`
    }
  };
  const resChannel = await processTelegramUpdate(tgVerifyChannelUpdate);
  assert(
    resChannel.handled && resChannel.action === 'CALLBACK_VERIFY_CHANNEL_SUCCESS',
    'TEST-1B',
    'Bot performs real channel membership verification and asks for Member ID'
  );

  // =================================================================
  // TEST 6: WRONG MEMBER ID
  // =================================================================
  console.log('\n--- TEST 6: Wrong Member ID Rejection ---');
  const tgWrongIdUpdate = {
    update_id: 81004,
    message: {
      message_id: 3,
      chat: { id: 777001, type: 'private' },
      from: { id: 777001, username: 'kidus_coder' },
      text: 'ARX-WRONG-000'
    }
  };
  const resWrongId = await processTelegramUpdate(tgWrongIdUpdate);
  assert(
    resWrongId.handled && resWrongId.action === 'AWAITING_MEMBER_ID_MISMATCH',
    'TEST-6A',
    'Bot rejects mismatched Member ID'
  );

  const sessionBeforeValid = db.getActivationSession(applicantSessionToken);
  assert(
    sessionBeforeValid?.activationCode === undefined,
    'TEST-6B',
    'Invalid Member ID does not generate a valid activation code'
  );

  // 1.3 User enters valid Member ID -> Bot generates code
  console.log('\n--- Resuming TEST 1: Bot Activation Code Generation & Delivery ---');
  const tgCorrectIdUpdate = {
    update_id: 81005,
    message: {
      message_id: 4,
      chat: { id: 777001, type: 'private' },
      from: { id: 777001, username: 'kidus_coder' },
      text: applicantMemberId
    }
  };
  const resCorrectId = await processTelegramUpdate(tgCorrectIdUpdate);
  const deliveredCode = resCorrectId.details?.code;

  assert(
    resCorrectId.handled &&
    resCorrectId.action === 'MEMBER_ID_VERIFIED_CODE_ISSUED' &&
    Boolean(deliveredCode) &&
    /^ARX-ACT-\d{4}$/.test(deliveredCode),
    'TEST-1C',
    'Bot generates and delivers canonical ARX-ACT-XXXX activation code'
  );

  // =================================================================
  // TEST 2: WRONG ACTIVATION CODE
  // =================================================================
  console.log('\n--- TEST 2: Wrong Activation Code Rejection ---');
  const { req: wrongCodeReq, res: wrongCodeRes, getStatusCode: wrongCodeStatus, getResponseData: wrongCodeData } = createMockReqRes({
    code: 'ARX-ACT-0000',
    memberId: applicantMemberId
  });
  authController.activateAccount(wrongCodeReq, wrongCodeRes);

  assert(
    wrongCodeStatus() === 400 && Boolean(wrongCodeData()?.error),
    'TEST-2A',
    'Incorrect activation code rejected with clear error'
  );

  const memberAfterWrongCode = db.findMemberById(applicantUserId);
  assert(
    memberAfterWrongCode?.telegramActivated !== true,
    'TEST-2B',
    'Account remains inactive after incorrect activation code'
  );

  // =================================================================
  // TEST 3: EXPIRED CODE (5-minute expiration)
  // =================================================================
  console.log('\n--- TEST 3: Expired Code Rejection (5-Minute Window) ---');
  const expMember = db.createMember({
    firstName: 'Expire',
    lastName: 'Tester',
    class: '9B',
    phoneNumber: '+251 911 888 999',
    telegramUsername: '@expire_tester',
    password: 'Arx@Club2026!'
  });
  const expSession = db.createActivationSession(expMember.id, expMember.memberId, expMember.studentName, expMember.telegramUsername);
  expSession.channelVerified = true;
  const expCodeResult = db.generateActivationCodeForSession(expSession.token, 777999, '@expire_tester');
  // Simulate 6 minutes passing
  expSession.activationCodeExpiresAt = new Date(Date.now() - 60000).toISOString();

  const { req: expReq, res: expRes, getStatusCode: expStatus, getResponseData: expData } = createMockReqRes({
    code: expCodeResult.code,
    memberId: expMember.memberId
  });
  authController.activateAccount(expReq, expRes);

  assert(
    expStatus() === 400 && expData()?.error?.toLowerCase().includes('expired'),
    'TEST-3A',
    'Code rejected as expired after 5-minute validity window'
  );

  const memberAfterExp = db.findMemberById(expMember.id);
  assert(
    memberAfterExp?.telegramActivated !== true,
    'TEST-3B',
    'Account remains inactive after expired code attempt'
  );

  // =================================================================
  // COMPLETING TEST 1: User enters correct code on website
  // =================================================================
  console.log('\n--- Completing TEST 1: Website Activation & Member Login ---');
  const { req: actReq, res: actRes, getStatusCode: actStatus, getResponseData: actData } = createMockReqRes({
    code: deliveredCode,
    memberId: applicantMemberId
  });
  authController.activateAccount(actReq, actRes);

  assert(
    actStatus() === 200 && actData()?.success && actData()?.member?.telegramActivated === true,
    'TEST-1D',
    'Server validates activation code, atomically activates account, and links Telegram identity'
  );

  const activeMember = db.findMemberById(applicantUserId);
  assert(
    activeMember?.status === 'active' &&
    activeMember?.telegramActivated === true &&
    activeMember?.telegramUserId === 777001,
    'TEST-1E',
    'Member profile is active with permanent numeric Telegram ID linked'
  );

  // Login succeeds for activated member
  const { req: loginReq, res: loginRes, getStatusCode: loginStatus, getResponseData: loginData } = createMockReqRes({
    memberId: applicantMemberId,
    password: 'Arx@Club2026!'
  });
  authController.login(loginReq, loginRes);
  assert(
    loginStatus() === 200 && loginData()?.success && Boolean(loginData()?.token),
    'TEST-1F',
    'Activated member can sign in to the Member Portal'
  );

  // =================================================================
  // TEST 4: REUSED CODE (Single-use enforcement)
  // =================================================================
  console.log('\n--- TEST 4: Single-Use Protection (Reused Code Rejection) ---');
  const { req: reuseReq, res: reuseRes, getResponseData: reuseData } = createMockReqRes({
    code: deliveredCode,
    memberId: applicantMemberId
  });
  authController.activateAccount(reuseReq, reuseRes);

  assert(
    reuseData()?.alreadyActive === true || reuseData()?.code === 'ALREADY_ACTIVATED',
    'TEST-4',
    'Single-use protection enforced: already-used code rejected'
  );

  // =================================================================
  // SUMMARY REPORT
  // =================================================================
  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} tests`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCriticalVerification().catch((err) => {
  console.error('Critical verification crashed:', err);
  process.exit(1);
});