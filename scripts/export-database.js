import fs from 'fs';
import path from 'path';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'arx_jwt_secret_dev_key_2026';
process.env.TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'arx_webhook_secret_2026';

async function exportDatabase() {
  const { db } = await import('../backend/src/services/db.js');

  const exportData = {
    exportedAt: new Date().toISOString(),
    description: "ARX IT CLUB OF SJS Full Database Export",
    settings: db.settings || {},
    members: Array.from(db.members?.values() || []),
    courses: Array.from(db.courses?.values() || []),
    enrollments: Array.from(db.enrollments?.values() || []),
    certificates: Array.from(db.certificates?.values() || []),
    awards: Array.from(db.awards?.values() || []),
    projects: Array.from(db.projects?.values() || []),
    events: Array.from(db.events?.values() || []),
    achievements: Array.from(db.achievements?.values() || []),
    announcements: Array.from(db.announcements?.values() || []),
    activities: Array.from(db.activities?.values() || []),
    telegramBroadcasts: Array.from(db.telegramBroadcasts?.values() || []),
    attendanceSessionConfigs: db.attendanceSessionConfigs || [],
    attendanceRecords: Array.from(db.attendanceRecords?.values() || []),
    assignments: Array.from(db.assignments?.values() || []),
    assignmentSubmissions: Array.from(db.assignmentSubmissions?.values() || []),
    clubResources: Array.from(db.clubResources?.values() || []),
    media: Array.from(db.media?.values() || []),
    socialLinks: Array.from(db.socialLinks?.values() || []),
    governance: Array.from(db.governance?.values() || []),
    botCommands: Array.from(db.botCommands?.values() || [])
  };

  const downloadsDir = path.resolve('C:/Users/Administrator/Downloads');
  const targetJsonPath = path.join(downloadsDir, 'arx_database.json');
  const localJsonPath = path.resolve(process.cwd(), 'arx_database.json');

  const formattedJson = JSON.stringify(exportData, null, 2);

  fs.writeFileSync(targetJsonPath, formattedJson, 'utf-8');
  console.log(`Successfully exported database to: ${targetJsonPath}`);

  fs.writeFileSync(localJsonPath, formattedJson, 'utf-8');
  console.log(`Also saved local copy to: ${localJsonPath}`);

  console.log(`Stats:`);
  console.log(`- Members: ${exportData.members.length}`);
  console.log(`- Courses: ${exportData.courses.length}`);
  console.log(`- Projects: ${exportData.projects.length}`);
  console.log(`- Events: ${exportData.events.length}`);
  console.log(`- Certificates: ${exportData.certificates.length}`);
  console.log(`- Media Items: ${exportData.media.length}`);
  console.log(`- Announcements: ${exportData.announcements.length}`);
}

exportDatabase().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
