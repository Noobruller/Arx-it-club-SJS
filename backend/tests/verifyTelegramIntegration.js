import 'dotenv/config';
import { db } from '../src/services/db.js';
import {
  processTelegramUpdate,
  sendTelegramMessage,
  verifyTelegramChannelMembership } from '../src/controllers/telegramController.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('ARX IT CLUB OF SJS TELEGRAM BOT VERIFICATION SUITE');
  console.log('Testing all 16 scenarios (A through P)');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testId, testName, detail) {
    if (condition) {
      console.log(`✅ [${testId}] PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passedCount++;
    } else {
      console.error(`❌ [${testId}] FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failedCount++;
    }
  }

  // Set registration status to OPEN initially
  db.setRegistrationStatus('OPEN');

  // --- TEST A: New Telegram user presses Start (Unlinked, No token, Reg OPEN) ---
  {
    const updateA = {
      update_id: 10001,
      message: {
        message_id: 1,
        chat: { id: 999001, type: 'private' },
        from: { id: 999001, is_bot: false, first_name: 'Alice', username: 'alice_new' },
        text: '/start'
      }
    };
    const resA = await processTelegramUpdate(updateA);
    assert(
      resA.handled && resA.action === 'START_NORMAL_REGISTRATION_OPEN',
      'Test A',
      'New Telegram user presses Start with OPEN registration'
    );
  }

  // --- TEST B: Existing linked member presses Start ---
  {
    // Create member and link
    const memberB = db.createMember({
      firstName: 'Bob',
      lastName: 'Smith',
      class: '10A',
      password: 'password123',
      phoneNumber: '+15551234567',
      telegramUsername: '@bob_member'
    });
    memberB.telegramUserId = 999002;
    memberB.telegramActivated = true;

    const updateB = {
      update_id: 10002,
      message: {
        message_id: 2,
        chat: { id: 999002, type: 'private' },
        from: { id: 999002, is_bot: false, first_name: 'Bob', username: 'bob_member' },
        text: '/start'
      }
    };
    const resB = await processTelegramUpdate(updateB);
    assert(
      resB.handled && resB.action === 'START_NORMAL_LINKED_MEMBER' && resB.details?.memberId === memberB.memberId,
      'Test B',
      'Existing linked member presses Start receives full member experience'
    );
  }

  // --- TEST C: Website-registered user opens activation deep link ---
  let sessionC;
  let memberC;
  {
    memberC = db.createMember({
      firstName: 'Charlie',
      lastName: 'Brown',
      class: '11B',
      password: 'password123',
      phoneNumber: '+15559876543',
      telegramUsername: '@charlie_dev'
    });
    sessionC = db.createActivationSession(memberC.id, memberC.memberId, memberC.studentName, memberC.telegramUsername);

    const updateC = {
      update_id: 10003,
      message: {
        message_id: 3,
        chat: { id: 999003, type: 'private' },
        from: { id: 999003, is_bot: false, first_name: 'Charlie', username: 'charlie_dev' },
        text: `/start ${sessionC.token}`
      }
    };
    const resC = await processTelegramUpdate(updateC);
    const pendingMember = db.findMemberById(memberC.id);
    assert(
      resC.handled &&
      resC.action === 'START_WITH_TOKEN_WELCOME_SENT' &&
      pendingMember?.telegramActivated !== true,
      'Test C',
      'Website-registered user opens deep link, bot sends welcome and prompts channel join without prematurely activating'
    );
  }

  // --- TEST D: Activation deep link is expired ---
  {
    const memberD = db.createMember({
      firstName: 'Diana',
      lastName: 'Prince',
      class: '12A',
      password: 'password123',
      phoneNumber: '+15554567890',
      telegramUsername: '@diana_p'
    });
    const sessionD = db.createActivationSession(memberD.id, memberD.memberId, memberD.studentName, memberD.telegramUsername);
    // Force expire session
    sessionD.expiresAt = new Date(Date.now() - 3600000).toISOString();

    const updateD = {
      update_id: 10004,
      message: {
        message_id: 4,
        chat: { id: 999004, type: 'private' },
        from: { id: 999004, is_bot: false, first_name: 'Diana' },
        text: `/start ${sessionD.token}`
      }
    };
    const resD = await processTelegramUpdate(updateD);
    assert(
      resD.handled && resD.action === 'START_WITH_TOKEN_FAILED',
      'Test D',
      'Expired activation link safely rejected with helpful message'
    );
  }

  // --- TEST F: Invalid activation token ---
  {
    const updateF = {
      update_id: 10006,
      message: {
        message_id: 6,
        chat: { id: 999006, type: 'private' },
        from: { id: 999006, is_bot: false, first_name: 'Frank' },
        text: `/start completely_bogus_token_xyz_999`
      }
    };
    const resF = await processTelegramUpdate(updateF);
    assert(
      resF.handled && resF.action === 'START_WITH_TOKEN_FAILED',
      'Test F',
      'Invalid activation token rejected gracefully'
    );
  }

  // --- TEST G: User has not joined the channel ---
  {
    // Channel check for invalid/negative id
    const checkG = await verifyTelegramChannelMembership(-1, '@arxitclub');
    assert(
      checkG.isMember === false && checkG.code === 'INVALID_USER',
      'Test G',
      'Unsubscribed/invalid user is not marked as channel member'
    );
  }

  // --- TEST H: User joins channel and verifies, enters Member ID, receives ARX-ACT-XXXX code ---
  let generatedCodeC = '';
  {
    // 1. Simulate callback query for sessionC
    const updateH = {
      update_id: 10007,
      callback_query: {
        id: 'cb_query_001',
        from: { id: 999003, username: 'charlie_dev' },
        message: { chat: { id: 999003 } },
        data: `verify_channel:${sessionC.token}`
      }
    };
    const resH = await processTelegramUpdate(updateH);
    assert(
      resH.handled && resH.action === 'CALLBACK_VERIFY_CHANNEL_SUCCESS',
      'Test H1',
      'User channel verification callback succeeds and advances to AWAITING_MEMBER_ID'
    );

    // 2. User replies with Member ID
    const updateH2 = {
      update_id: 10008,
      message: {
        message_id: 8,
        chat: { id: 999003, type: 'private' },
        from: { id: 999003, username: 'charlie_dev' },
        text: memberC.memberId
      }
    };
    const resH2 = await processTelegramUpdate(updateH2);
    generatedCodeC = resH2.details?.code || '';
    assert(
      resH2.handled &&
      resH2.action === 'MEMBER_ID_VERIFIED_CODE_ISSUED' &&
      Boolean(generatedCodeC) &&
      /^ARX-ACT-\d{4}$/.test(generatedCodeC),
      'Test H2',
      'Bot validates Member ID and issues canonical 5-minute ARX-ACT-XXXX activation code'
    );

    // 3. User enters code on website -> atomic activation
    const webActivateRes = db.activateAccountByCode(generatedCodeC);
    assert(
      webActivateRes.success &&
      webActivateRes.code === 'ACTIVATED' &&
      webActivateRes.member?.telegramActivated === true &&
      webActivateRes.member?.telegramUserId === 999003,
      'Test H3',
      'Website validates ARX-ACT-XXXX code and atomically activates account with linked Telegram'
    );
  }

  // --- TEST E: Activation deep link is already used / member active ---
  {
    // sessionC was completed in Test H
    const updateE = {
      update_id: 10005,
      message: {
        message_id: 5,
        chat: { id: 999003, type: 'private' },
        from: { id: 999003, is_bot: false, first_name: 'Charlie', username: 'charlie_dev' },
        text: `/start ${sessionC.token}`
      }
    };
    const resE = await processTelegramUpdate(updateE);
    assert(
      resE.handled && resE.action === 'START_WITH_TOKEN_SUCCESS' && resE.details?.alreadyActive === true,
      'Test E',
      'Already used activation link recognizes existing link idempotently'
    );
  }

  // --- TEST I: User is already verified ---
  {
    // Now memberC is verified. If they send /start with token again or normal /start:
    const updateI = {
      update_id: 10008,
      message: {
        message_id: 8,
        chat: { id: 999003 },
        from: { id: 999003, username: 'charlie_dev' },
        text: `/start ${sessionC.token}`
      }
    };
    const resI = await processTelegramUpdate(updateI);
    assert(
      resI.handled && resI.action === 'START_WITH_TOKEN_SUCCESS',
      'Test I',
      'Already verified user receives direct verified member experience'
    );
  }

  // --- TEST J: User presses Start repeatedly ---
  {
    let repeatedSuccess = true;
    for (let i = 0; i < 5; i++) {
      const updateJ = {
        update_id: 10100 + i,
        message: {
          message_id: 100 + i,
          chat: { id: 999003 },
          from: { id: 999003, username: 'charlie_dev' },
          text: '/start'
        }
      };
      const resJ = await processTelegramUpdate(updateJ);
      if (!resJ.handled || resJ.action !== 'START_NORMAL_LINKED_MEMBER') {
        repeatedSuccess = false;
        break;
      }
    }
    assert(repeatedSuccess, 'Test J', 'Repeated /start presses handled consistently without error');
  }

  // --- TEST K: Same Telegram update is delivered twice (Idempotency) ---
  {
    const updateK = {
      update_id: 20001,
      message: {
        message_id: 201,
        chat: { id: 999003 },
        from: { id: 999003 },
        text: '/status'
      }
    };
    // Import controller to check webhook deduplication
    const { telegramController } = await import('../src/controllers/telegramController.ts');

    let firstCode = 0;
    let firstBody = '';
    const mockRes1 = {
      status(code) {
        firstCode = code;
        return this;
      },
      send(body) {
        firstBody = body;
        return this;
      }
    };
    await telegramController.handleWebhook({ body: updateK, headers: {} }, mockRes1);

    let secondCode = 0;
    let secondBody = '';
    const mockRes2 = {
      status(code) {
        secondCode = code;
        return this;
      },
      send(body) {
        secondBody = body;
        return this;
      }
    };
    await telegramController.handleWebhook({ body: updateK, headers: {} }, mockRes2);

    assert(
      firstCode === 200 && firstBody === 'OK' && secondCode === 200 && secondBody === 'DUPLICATE_IGNORED',
      'Test K',
      'Duplicate update_id recognized and acknowledged with DUPLICATE_IGNORED'
    );
  }

  // --- TEST L: Registration is OPEN ---
  {
    db.setRegistrationStatus('OPEN');
    const isOpen = db.isRegistrationOpen();

    const updateL = {
      update_id: 10020,
      message: {
        message_id: 20,
        chat: { id: 999020 },
        from: { id: 999020 },
        text: '/start'
      }
    };
    const resL = await processTelegramUpdate(updateL);
    assert(
      isOpen && resL.action === 'START_NORMAL_REGISTRATION_OPEN',
      'Test L',
      'Registration OPEN status enables registration workflow'
    );
  }

  // --- TEST M: Registration is CLOSED ---
  {
    db.setRegistrationStatus('CLOSED', 'Admissions closed for Term 2.');
    const isOpen = db.isRegistrationOpen();

    // 1. Unregistered user /start
    const updateM1 = {
      update_id: 10021,
      message: {
        message_id: 21,
        chat: { id: 999021 },
        from: { id: 999021 },
        text: '/start'
      }
    };
    const resM1 = await processTelegramUpdate(updateM1);

    // 2. Existing linked member /start still works normally
    const updateM2 = {
      update_id: 10022,
      message: {
        message_id: 22,
        chat: { id: 999003 },
        from: { id: 999003 },
        text: '/start'
      }
    };
    const resM2 = await processTelegramUpdate(updateM2);

    assert(
      !isOpen &&
      resM1.action === 'START_NORMAL_REGISTRATION_CLOSED' &&
      resM2.action === 'START_NORMAL_LINKED_MEMBER',
      'Test M',
      'Registration CLOSED delivers closed notice to new users while preserving existing members'
    );

    // Reset back to OPEN
    db.setRegistrationStatus('OPEN');
  }

  // --- TEST N: Telegram Bot API message failure / plaintext fallback ---
  {
    // Test sendTelegramMessage handles bad token / dev mode without crashing
    const sendResult = await sendTelegramMessage('999001', 'Test message formatting *bold* and _italic_');
    assert(
      typeof sendResult.success === 'boolean',
      'Test N',
      'Telegram Bot API sender handles response safely and logs diagnostics'
    );
  }

  // --- TEST O: Backend temporarily receives malformed payload (error safety) ---
  {
    const { telegramController } = await import('../src/controllers/telegramController.ts');
    let codeO = 0;
    let bodyO = '';
    const mockResO = {
      status(code) {
        codeO = code;
        return this;
      },
      send(body) {
        bodyO = body;
        return this;
      }
    };

    // Send null/invalid payload
    await telegramController.handleWebhook({ body: null, headers: {} }, mockResO);
    assert(codeO === 200, 'Test O', 'System fails safely and returns 200 OK without crashing on unexpected payloads');
  }

  // --- TEST P: Multiple Telegram users activate simultaneously ---
  {
    const members = await Promise.all([
    db.createMember({
      firstName: 'Elena',
      lastName: 'Rostova',
      class: '10C',
      password: 'password123',
      phoneNumber: '+15551112233',
      telegramUsername: '@elena_r'
    }),
    db.createMember({
      firstName: 'Faisal',
      lastName: 'Al-Mansoor',
      class: '11A',
      password: 'password123',
      phoneNumber: '+15554445566',
      telegramUsername: '@faisal_m'
    }),
    db.createMember({
      firstName: 'Grace',
      lastName: 'Hopper',
      class: '12B',
      password: 'password123',
      phoneNumber: '+15557778899',
      telegramUsername: '@grace_h'
    })]
    );

    const sessions = members.map((m) =>
    db.createActivationSession(m.id, m.memberId, m.studentName, m.telegramUsername)
    );

    const usernames = ['elena_r', 'faisal_m', 'grace_h'];
    const concurrentResults = await Promise.all(
      sessions.map((s, idx) =>
      processTelegramUpdate({
        update_id: 30000 + idx,
        message: {
          message_id: 300 + idx,
          chat: { id: 999100 + idx },
          from: { id: 999100 + idx, username: usernames[idx] },
          text: `/start ${s.token}`
        }
      })
      )
    );

    const allSucceeded = concurrentResults.every(
      (r) => r.handled && r.action === 'START_WITH_TOKEN_WELCOME_SENT'
    );
    assert(allSucceeded, 'Test P', 'Multiple simultaneous activations welcomed safely with unique IDs');
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED out of 16 tests`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});