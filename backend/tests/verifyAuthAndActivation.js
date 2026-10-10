import { db } from '../src/services/db.js';
import { validateStrongPassword } from '../src/utils/passwordUtils.js';

async function runTests() {
  console.log('================================================================');
  console.log('ARX IT CLUB OF SJS — AUTHENTICATION, PASSWORD & ACTIVATION VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, failureDetail) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${failureDetail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Password Policy Unit Tests
  console.log('--- SECTION 1: Password Strength & Policy Validation ---');

  const emptyRes = validateStrongPassword('');
  assert(!emptyRes.valid, 'Empty password rejected');

  const shortRes = validateStrongPassword('Ax1!');
  assert(!shortRes.valid && shortRes.errors.some((e) => e.includes('8 characters')), 'Short password (<8 chars) rejected');

  const noUpperRes = validateStrongPassword('arx@club2026!');
  assert(!noUpperRes.valid && noUpperRes.errors.some((e) => e.includes('uppercase')), 'Password without uppercase rejected');

  const noLowerRes = validateStrongPassword('ARX@CLUB2026!');
  assert(!noLowerRes.valid && noLowerRes.errors.some((e) => e.includes('lowercase')), 'Password without lowercase rejected');

  const noNumRes = validateStrongPassword('Arx@ClubSecret!');
  assert(!noNumRes.valid && noNumRes.errors.some((e) => e.includes('number')), 'Password without number rejected');

  const noSpecialRes = validateStrongPassword('ArxClub2026Pass');
  assert(!noSpecialRes.valid && noSpecialRes.errors.some((e) => e.includes('special character')), 'Password without special character rejected');

  const commonWeakRes = validateStrongPassword('password123', { confirmPassword: 'password123' });
  assert(!commonWeakRes.valid, 'Common weak password (password123) rejected');

  const personalInfoRes = validateStrongPassword('Dawit@Club2026!', {
    confirmPassword: 'Dawit@Club2026!',
    personalInfo: ['Dawit', 'Kebede', '911234567']
  });
  assert(!personalInfoRes.valid && personalInfoRes.strength === 'Too weak', 'Personal-info-based password containing user name rejected');

  const mismatchRes = validateStrongPassword('Arx@Club2026!', {
    confirmPassword: 'Arx@Different2026!'
  });
  assert(!mismatchRes.valid && mismatchRes.errors.includes('Passwords do not match.'), 'Mismatched confirm password rejected with "Passwords do not match."');

  const strongValidRes = validateStrongPassword('Arx@Club2026!', {
    confirmPassword: 'Arx@Club2026!',
    personalInfo: ['Nathan', 'Haddis']
  });
  assert(strongValidRes.valid && (strongValidRes.strength === 'Strong' || strongValidRes.strength === 'Very strong'), 'Strong password Arx@Club2026! accepted with matching confirmation');

  // 2. Database & Activation Flow Tests
  console.log('\n--- SECTION 2: Account Creation & Activation Flow ---');

  // Create test member with strong password
  const courses = db.getCourses(true);
  const testCourse = courses[0];

  const testMember = db.createMember({
    firstName: 'Abebe',
    lastName: 'Bikila',
    class: '11A',
    password: 'Arx@Club2026!',
    phoneNumber: '+251911999888',
    telegramUsername: '@abebe_runner'
  });

  assert(Boolean(testMember.memberId && testMember.memberId.startsWith('ARX-2026-')), 'Member created with sequential format ARX-2026-###');
  assert(!testMember.telegramActivated, 'Newly created member is not yet activated');

  // Create activation session (Requirement 1: Do NOT generate code at registration)
  const activationSession = db.createActivationSession(
    testMember.id,
    testMember.memberId,
    testMember.studentName,
    testMember.telegramUsername
  );

  assert(activationSession.activationCode === undefined, 'Activation code NOT generated automatically on registration page');
  assert(activationSession.status === 'pending', 'Initial session status is pending');
  assert(activationSession.channelVerified === false, 'Initial session channelVerified is false');

  // Verify channel membership first
  db.verifyChannelMembershipForSession(activationSession.token);
  assert(activationSession.channelVerified === true, 'Channel verified on activation session');

  // Bot generates authoritative 5-minute single-use code ARX-ACT-XXXX
  const genCodeRes = db.generateActivationCodeForSession(
    activationSession.token,
    999888,
    '@abebe_runner'
  );
  assert(Boolean(genCodeRes.success && genCodeRes.code && /^ARX-ACT-\d{4}$/.test(genCodeRes.code)), 'Bot generated canonical ARX-ACT-XXXX code');

  // 3. Test Invalid Activation Codes
  console.log('\n--- SECTION 3: Activation Code Validation & Security ---');

  const invalidCodeRes = db.activateAccountByCode('ARX-ACT-0000');
  assert(!invalidCodeRes.success && invalidCodeRes.code === 'INVALID_CODE', 'Invalid activation code fails gracefully');

  const emptyCodeRes = db.activateAccountByCode('');
  assert(!emptyCodeRes.success && emptyCodeRes.code === 'INVALID_CODE', 'Empty activation code rejected');

  // 4. Test Valid Activation with human-readable activationCode
  const validActivationRes = db.activateAccountByCode(genCodeRes.code);
  assert(validActivationRes.success && validActivationRes.code === 'ACTIVATED', 'Valid activation code successfully activates account');
  assert(validActivationRes.member?.telegramActivated === true, 'Member marked activated in authoritative database');
  assert(validActivationRes.session?.status === 'completed', 'Activation session status marked completed');
  assert(validActivationRes.session?.activatedVia === 'website', 'Activation session recorded activatedVia: website');

  // 5. Test Already Activated Account
  const duplicateActivationRes = db.activateAccountByCode(genCodeRes.code);
  assert(!duplicateActivationRes.success && duplicateActivationRes.alreadyActive === true && duplicateActivationRes.code === 'ALREADY_ACTIVATED', 'Re-activating already activated account returns ALREADY_ACTIVATED message');

  // 6. Test Token lookup
  const lookupByToken = db.getActivationSession(activationSession.token);
  assert(Boolean(lookupByToken && lookupByToken.id === activationSession.id), 'Activation session lookup works via token');

  const lookupByCode = db.getActivationSession(genCodeRes.code);
  assert(Boolean(lookupByCode && lookupByCode.id === activationSession.id), 'Activation session lookup works via activationCode');

  // 7. Test Expired Activation Code
  const expiredSession = db.createActivationSession(testMember.id, testMember.memberId, testMember.studentName);
  expiredSession.channelVerified = true;
  const expiredGen = db.generateActivationCodeForSession(expiredSession.token, 999889);
  // Manually backdate activationCodeExpiresAt to simulate 5-minute expiry
  expiredSession.activationCodeExpiresAt = new Date(Date.now() - 360000).toISOString();
  const expiredRes = db.activateAccountByCode(expiredGen.code);
  assert(!expiredRes.success && expiredRes.code === 'EXPIRED_CODE', 'Expired activation code correctly rejected with EXPIRED_CODE');

  // 8. Test Member Identity & Data Preservation
  const fetchedMember = db.findMemberById(testMember.id);
  assert(fetchedMember !== undefined, 'Member record preserved in database');
  assert(fetchedMember?.memberId === testMember.memberId, 'Member ID strictly preserved without modification');
  assert(fetchedMember?.telegramActivated === true, 'Member maintains active status');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} tests`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});