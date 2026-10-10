import 'dotenv/config';
import { db } from '../src/services/db.js';
import { testFullTelegramConnection } from '../src/controllers/telegramController.js';

async function runExtendedTestSuite() {
  console.log('================================================================');
  console.log('ARX IT CLUB OF SJS TELEGRAM BOT EXTENDED COMMANDS & ADMIN OPERATIONS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testId, testName, detail) {
    if (condition) {
      console.log(`✅ [${testId}] PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [${testId}] FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Set registration OPEN
  db.setRegistrationStatus('OPEN');

  // Create a sample member for testing commands
  const member = db.createMember({
    firstName: 'Sarah',
    lastName: 'Connor',
    class: '10C',
    password: 'password123',
    phoneNumber: '+15554321098',
    telegramUsername: '@sarah_c'
  });
  member.telegramUserId = 888101;
  member.telegramActivated = true;

  // Enroll in a course and issue a certificate
  const course = db.getCourses(false)[0];
  if (course) {
    const enr = db.enrollMemberInCourse(member.id, course.id);
    if (enr) {
      db.updateEnrollment(enr.id, { progress: 100, status: 'Completed' });
      db.issueCertificate({
        memberId: member.id,
        courseId: course.id,
        courseName: course.title,
        issueDate: 'May 1, 2026'
      });
    }
  }

  // 1. Test /help
  {
    const res = db.handleBotCommand('/help', member.id);
    assert(
      Boolean(res.reply.includes('ARX IT CLUB OF SJS') && res.reply.includes('/start') && res.actions && res.actions.length > 0),
      'Test 1',
      '/help returns complete command directory and interactive buttons'
    );
  }

  // 2. Test /menu
  {
    const res = db.handleBotCommand('/menu', member.id);
    assert(
      res.reply.includes('Main Navigation Menu') && (res.actions?.length || 0) >= 6,
      'Test 2',
      '/menu returns navigation buttons'
    );
  }

  // 3. Test /account and /profile
  {
    const resAcc = db.handleBotCommand('/account', member.id);
    const resProf = db.handleBotCommand('/profile', member.id);
    assert(
      resAcc.reply.includes(member.studentName) &&
      resAcc.reply.includes(member.memberId) &&
      resProf.reply.includes(member.studentName),
      'Test 3',
      '/account and /profile return real student membership details and attendance'
    );
  }

  // 4. Test /courses
  {
    const resCourses = db.handleBotCommand('/courses', member.id);
    assert(
      resCourses.reply.includes('Curriculum Tracks') && resCourses.reply.includes('Enrolled'),
      'Test 4',
      '/courses shows member enrollment progress and available tracks'
    );
  }

  // 5. Test /certificates
  {
    const resCerts = db.handleBotCommand('/certificates', member.id);
    assert(
      resCerts.reply.includes('Verified ARX Certificates') && resCerts.reply.includes(course?.title || ''),
      'Test 5',
      '/certificates displays verified credential IDs'
    );
  }

  // 6. Test /attendance
  {
    const resAtt = db.handleBotCommand('/attendance', member.id);
    assert(
      resAtt.reply.includes('Attendance Record') && resAtt.reply.includes('Sessions Logged'),
      'Test 6',
      '/attendance reports attendance sessions and eligibility percentage'
    );
  }

  // 7. Test /announcements
  {
    const resAnn = db.handleBotCommand('/announcements');
    assert(
      resAnn.reply.includes('Latest Announcements') || resAnn.reply.includes('announcements'),
      'Test 7',
      '/announcements returns official channel announcements feed'
    );
  }

  // 8. Test /events
  {
    const resEvents = db.handleBotCommand('/events');
    assert(
      resEvents.reply.includes('Workshops') || resEvents.reply.includes('Events'),
      'Test 8',
      '/events returns Computer Lab 3 workshops'
    );
  }

  // 9. Test /lab
  {
    const resLab = db.handleBotCommand('/lab');
    assert(
      resLab.reply.includes('Computer Lab 3') && resLab.reply.includes('Hours'),
      'Test 9',
      '/lab returns lab hours, location, and network rules'
    );
  }

  // 10. Test /support
  {
    const resSup = db.handleBotCommand('/support');
    assert(
      resSup.reply.includes('Contact & Support') || resSup.reply.includes('contact@arxitclub.org'),
      'Test 10',
      '/support returns contact channels and lab advisory hours'
    );
  }

  // 11. Test unknown command fallback
  {
    const resUnknown = db.handleBotCommand('/unknown_cmd_xyz');
    assert(
      resUnknown.reply.includes("I don't recognize that command") && (resUnknown.actions?.length || 0) > 0,
      'Test 11',
      'Unknown commands fall back gracefully with /help prompt'
    );
  }

  // 12. Test Member ID conversational verification flow
  {
    // Simulate user clicking /start <token>
    const applicant = db.createMember({
      firstName: 'David',
      lastName: 'Hassel',
      class: '9A',
      password: 'password123',
      phoneNumber: '+15557778899',
      telegramUsername: '@david_h'
    });
    const session = db.createActivationSession(applicant.id, applicant.memberId, applicant.studentName, applicant.telegramUsername);
    session.channelVerified = true;
    const userId = 888202;

    // Start with token sets user state to AWAITING_MEMBER_ID
    const startRes = db.handleBotCommand(`/start ${session.token}`, undefined, { id: userId, username: 'david_h' });
    assert(
      startRes.reply.includes('pending activation request') && startRes.reply.includes('Member ID'),
      'Test 12A',
      'Deep-link start prompts user to confirm their Member ID'
    );

    // User replies with wrong Member ID
    const wrongIdRes = db.handleBotCommand('WRONG-ID-999', undefined, { id: userId });
    assert(
      wrongIdRes.reply.includes('Verification Failed') && wrongIdRes.reply.includes('does not match'),
      'Test 12B',
      'Incorrect Member ID is rejected safely'
    );

    // User replies with correct Member ID
    const correctIdRes = db.handleBotCommand(applicant.memberId, undefined, { id: userId, username: 'david_h' });
    assert(
      Boolean(
        correctIdRes.reply.includes('Member ID Verified') &&
        correctIdRes.reply.includes('Temporary Website Activation Code') &&
        correctIdRes.actions &&
        correctIdRes.actions.some((a) => a.action.includes('activate?code='))
      ),
      'Test 12C',
      'Correct Member ID issues temporary activation code with website link'
    );
  }

  // 13. Test Suspended member restriction
  {
    const suspendedMember = db.createMember({
      firstName: 'Eve',
      lastName: 'Suspended',
      class: '11A',
      password: 'password123',
      phoneNumber: '+15553332211',
      telegramUsername: '@eve_s'
    });
    suspendedMember.status = 'suspended';
    suspendedMember.telegramUserId = 888303;

    const res = db.handleBotCommand('/status', undefined, { id: 888303 });
    assert(
      res.reply.includes('Membership Suspended') && res.reply.includes('restricted'),
      'Test 13',
      'Suspended member access is restricted with administrative appeal instructions'
    );
  }

  // 14. Test Admin command enable/disable and custom replies
  {
    // Disable /lab
    db.updateBotCommand('/lab', { isEnabled: false });
    const resDisabled = db.handleBotCommand('/lab');
    assert(
      resDisabled.reply.includes('temporarily disabled by club administrators'),
      'Test 14A',
      'Disabled command returns administrative notice'
    );

    // Set custom reply on /events
    db.updateBotCommand('/events', { customReply: '🎉 Special Hackathon Weekend is running! Register at the lab.' });
    const resCustom = db.handleBotCommand('/events');
    assert(
      resCustom.reply === '🎉 Special Hackathon Weekend is running! Register at the lab.',
      'Test 14B',
      'Custom reply override is returned when configured by admin'
    );

    // Restore
    db.updateBotCommand('/lab', { isEnabled: true });
    db.updateBotCommand('/events', { customReply: undefined });
  }

  // 15. Test Bot Status & Diagnostic Engine
  {
    const diag = await testFullTelegramConnection();
    assert(
      Array.isArray(diag.steps) && diag.steps.length >= 1,
      'Test 15',
      'Diagnostic test engine runs and returns structured step-by-step audit'
    );
  }

  console.log(`\n================================================================`);
  console.log(`EXTENDED TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runExtendedTestSuite().catch((e) => {
  console.error('Fatal error running extended tests:', e);
  process.exit(1);
});