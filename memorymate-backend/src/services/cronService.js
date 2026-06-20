// src/services/cronService.js
// Background cron job that fires reminders for due routines
// Runs every minute and dispatches FCM pushes to patients

const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { sendPush } = require('./notifyService');

const prisma = new PrismaClient();

// Check for routines due in the current minute and notify patient
async function checkAndFireReminders() {
  const now = new Date();
  // Format current time as "HH:MM" to match stored schedule
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  try {
    // Find all active routines scheduled for this exact time
    const dueRoutines = await prisma.routine.findMany({
      where: {
        scheduleTime: currentTime,
        isActive: true,
      },
      include: {
        patient: true, // need patient's FCM token
      },
    });

    for (const routine of dueRoutines) {
      // Create a log entry for this trigger
      await prisma.routineLog.create({
        data: {
          routineId: routine.id,
          scheduledTime: now,
          status: 'PENDING',
        },
      });

      // Send push notification to the patient's device
      await sendPush(
        routine.patient.fcmToken,
        `⏰ Reminder: ${routine.title}`,
        routine.description || 'Tap to mark as done or snooze.',
        {
          type: 'REMINDER',
          routineId: routine.id,
          routineType: routine.type,
        }
      );

      // Log to activity log
      await prisma.activityLog.create({
        data: {
          patientId: routine.patientId,
          eventType: 'REMINDER',
          payload: JSON.stringify({
            routineId: routine.id,
            title: routine.title,
            scheduledTime: currentTime,
          }),
        },
      });

      console.log(`⏰ Reminder fired for patient ${routine.patientId}: ${routine.title}`);
    }
  } catch (err) {
    console.error('Cron error (reminder check):', err.message);
  }
}

// Also mark routines as MISSED if still PENDING after 15 minutes
async function markMissedRoutines() {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

  try {
    const missed = await prisma.routineLog.updateMany({
      where: {
        status: 'PENDING',
        scheduledTime: { lt: cutoff },
      },
      data: { status: 'MISSED' },
    });

    if (missed.count > 0) {
      console.log(`📋 Marked ${missed.count} routine(s) as MISSED`);
    }
  } catch (err) {
    console.error('Cron error (missed check):', err.message);
  }
}

function startReminderCron() {
  // Run every minute: check for due reminders
  cron.schedule('* * * * *', checkAndFireReminders);

  // Run every 5 minutes: mark old PENDING logs as MISSED
  cron.schedule('*/5 * * * *', markMissedRoutines);

  console.log('⏱️  Reminder cron jobs started (every minute)');
}

module.exports = { startReminderCron };
